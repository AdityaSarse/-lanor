const mongoose = require("mongoose");

const Review  = require("../models/review.model");
const Product = require("../models/products.model");  // products.model (plural) — matches filename
const Order   = require("../models/order.model");
const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Base filter that excludes soft-deleted documents. */
const ALIVE = { deletedAt: null };

/**
 * Recalculates and persists averageRating + reviewCount on the Product document.
 * Called after every create, update, or delete operation.
 *
 * Uses MongoDB aggregation so the math is always accurate, even if reviews
 * were modified directly in the DB.
 * Only counts non-deleted reviews.
 *
 * @param {string|ObjectId} productId
 * @param {Object}          [session]  - Optional Mongoose session for transactions.
 */
const recalculateProductRating = async (productId, session) => {
    const result = await Review.aggregate([
        { $match: { product: productId, deletedAt: null } },
        {
            $group: {
                _id:           "$product",
                averageRating: { $avg: "$rating" },
                reviewCount:   { $sum: 1 }
            }
        }
    ]).session(session || null);

    const update = result.length > 0
        ? {
            // Round to 1 decimal place — e.g. 4.3, not 4.333333
            averageRating: Math.round(result[0].averageRating * 10) / 10,
            reviewCount:   result[0].reviewCount
          }
        : { averageRating: 0, reviewCount: 0 };    // all reviews deleted → reset

    await Product.findByIdAndUpdate(productId, update, { session: session || null });
};

// ─────────────────────────────────────────────────────────────────────────────
// Review Service
// ─────────────────────────────────────────────────────────────────────────────

// ─── createReview ─────────────────────────────────────────────────────────────
/**
 * Creates a verified-purchase review inside a MongoDB transaction.
 *
 * Business rule checks (in order):
 *   1. Product exists and is active (not soft-deleted).
 *   2. Order exists.
 *   3. Order belongs to the logged-in user.
 *   4. Order status is "Delivered".
 *   5. Product is part of that order.
 *   6. User hasn't already reviewed this product (checked pre-insert + E11000 catch).
 *   7. Create the review.
 *   8. Recalculate product averageRating + reviewCount (inside the same transaction).
 *
 * @param {Object} data   - Validated fields from the controller.
 * @param {string} userId - req.user._id — injected by verifyJWT.
 * @returns {Promise<Review>}
 */
const createReview = async (data, userId) => {
    const { product: productId, order: orderId, ...reviewFields } = data;

    // ── 1. Product exists ─────────────────────────────────────────────────────
    const product = await Product.findOne({ _id: productId, ...ALIVE });
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // ── 2. Order exists ───────────────────────────────────────────────────────
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // ── 3. Order belongs to the logged-in user ────────────────────────────────
    if (order.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only review products from your own orders");
    }

    // ── 4. Order must be delivered ────────────────────────────────────────────
    if (order.orderStatus !== "Delivered") {
        throw new ApiError(400, "You can only review products from delivered orders");
    }

    // ── 5. Product must be part of the order ──────────────────────────────────
    const productInOrder = order.items.some(
        (item) => item.product.toString() === productId.toString()
    );
    if (!productInOrder) {
        throw new ApiError(400, "This product is not part of the specified order");
    }

    // ── 6. Duplicate review check (pre-insert) ────────────────────────────────
    // The unique index is the final guard, but checking here returns a clean
    // 409 rather than leaking a raw MongoServerError on the happy path.
    const existingReview = await Review.exists({ user: userId, product: productId, ...ALIVE });
    if (existingReview) {
        throw new ApiError(409, "You have already reviewed this product");
    }

    // ── 7 + 8. Create review & update product stats inside a transaction ───────
    // If the rating update crashes after insert, the transaction rolls both back.
    const session = await mongoose.startSession();
    let createdReview;

    try {
        await session.withTransaction(async () => {
            const [review] = await Review.create(
                [{ ...reviewFields, user: userId, product: productId, order: orderId }],
                { session }
            );
            createdReview = review;
            await recalculateProductRating(product._id, session);
        });
    } catch (err) {
        // ── Catch race-condition duplicate key (E11000) ───────────────────────
        if (err.code === 11000) {
            throw new ApiError(409, "You have already reviewed this product");
        }
        throw err;
    } finally {
        session.endSession();
    }

    return Review.findById(createdReview._id)
        .populate("user", "firstName lastName avatar")
        .lean();
};

// ─── getProductReviews ────────────────────────────────────────────────────────
/**
 * Returns paginated, non-deleted reviews for a specific product.
 *
 * Validates that the product actually exists before querying reviews —
 * prevents GET /reviews/product/randomId from returning [] instead of 404.
 *
 * Supported sort values: "newest" (default), "highest", "lowest"
 *
 * @param {string} productId - MongoDB ObjectId of the product.
 * @param {Object} options   - Pagination + sort from req.query.
 * @returns {Promise<{reviews, total, page, totalPages}>}
 */
const getProductReviews = async (productId, options = {}) => {
    // Validate product exists first
    const product = await Product.findOne({ _id: productId, ...ALIVE });
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const { page = 1, limit = 10, sort = "newest" } = options;

    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const sortMap = {
        newest:  { createdAt: -1 },
        highest: { rating: -1, createdAt: -1 },
        lowest:  { rating:  1, createdAt: -1 }
    };
    const sortField = sortMap[sort] || sortMap.newest;

    const query = { product: productId, ...ALIVE };

    const [reviews, total] = await Promise.all([
        Review.find(query)
            .populate("user", "firstName lastName avatar")
            .sort(sortField)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Review.countDocuments(query)
    ]);

    return {
        reviews,
        total,
        page:       pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
};

// ─── getReviewById ────────────────────────────────────────────────────────────
/**
 * Fetches a single non-deleted review by its ObjectId.
 *
 * @param {string} id - MongoDB ObjectId string.
 * @returns {Promise<Review>}
 * @throws {ApiError} 404 if not found or soft-deleted.
 */
const getReviewById = async (id) => {
    const review = await Review.findOne({ _id: id, ...ALIVE })
        .populate("user",    "firstName lastName avatar")
        .populate("product", "name slug")
        .lean();

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    return review;
};

// ─── getAllReviews ────────────────────────────────────────────────────────────
/**
 * Admin-only: returns all non-deleted reviews with rich filtering.
 * Useful for moderation dashboards.
 *
 * Filters: productId, userId, rating, page, limit, sort
 *
 * @param {Object} filters - Parsed query params.
 * @returns {Promise<{reviews, total, page, totalPages}>}
 */
const getAllReviews = async (filters = {}) => {
    const {
        productId,
        userId,
        rating,
        page  = 1,
        limit = 20,
        sort  = "newest"
    } = filters;

    const query = { ...ALIVE };

    if (productId) query.product = productId;
    if (userId)    query.user    = userId;
    if (rating)    query.rating  = parseInt(rating, 10);

    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const sortMap = {
        newest:  { createdAt: -1 },
        oldest:  { createdAt:  1 },
        highest: { rating: -1 },
        lowest:  { rating:  1 }
    };
    const sortField = sortMap[sort] || sortMap.newest;

    const [reviews, total] = await Promise.all([
        Review.find(query)
            .populate("user",    "firstName lastName avatar")
            .populate("product", "name slug")
            .sort(sortField)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Review.countDocuments(query)
    ]);

    return {
        reviews,
        total,
        page:       pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
};

// ─── updateReview ─────────────────────────────────────────────────────────────
/**
 * Updates a review's content (rating, title, comment, images).
 * Only the review owner or an admin can update.
 * Recalculates product stats only when the rating actually changes.
 *
 * @param {string} reviewId - MongoDB ObjectId of the review.
 * @param {Object} data     - Validated partial fields from the controller.
 * @param {Object} reqUser  - req.user — { _id, role } from verifyJWT.
 * @returns {Promise<Review>}
 */
const updateReview = async (reviewId, data, reqUser) => {
    const review = await Review.findOne({ _id: reviewId, ...ALIVE });
    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    const isOwner = review.user.toString() === reqUser._id.toString();
    const isAdmin = reqUser.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "You are not allowed to edit this review");
    }

    const ratingChanged = data.rating !== undefined && data.rating !== review.rating;

    Object.assign(review, data);
    await review.save();

    // Only recalculate if the rating actually changed — saves a DB round-trip
    if (ratingChanged) {
        await recalculateProductRating(review.product);
    }

    return Review.findById(review._id)
        .populate("user", "firstName lastName avatar")
        .lean();
};

// ─── deleteReview ─────────────────────────────────────────────────────────────
/**
 * Soft-deletes a review by stamping deletedAt.
 * Only the review owner or an admin can delete.
 * Recalculates product stats after deletion.
 *
 * @param {string} reviewId - MongoDB ObjectId of the review.
 * @param {Object} reqUser  - req.user — { _id, role } from verifyJWT.
 * @returns {Promise<void>}
 */
const deleteReview = async (reviewId, reqUser) => {
    const review = await Review.findOne({ _id: reviewId, ...ALIVE });
    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    const isOwner = review.user.toString() === reqUser._id.toString();
    const isAdmin = reqUser.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "You are not allowed to delete this review");
    }

    const productId = review.product;

    review.deletedAt = new Date();
    await review.save();

    await recalculateProductRating(productId);
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createReview,
    getProductReviews,
    getReviewById,
    getAllReviews,
    updateReview,
    deleteReview
};
