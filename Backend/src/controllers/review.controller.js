const asyncHandler    = require("../utils/asyncHandler");
const ApiResponse     = require("../utils/ApiResponse");
const reviewService   = require("../services/review.service");

// ─────────────────────────────────────────────────────────────────────────────
// Create Review
// POST /api/v1/reviews
// ─────────────────────────────────────────────────────────────────────────────
const createReview = asyncHandler(async (req, res) => {
    const review = await reviewService.createReview(req.body, req.user._id);

    return res
        .status(201)
        .json(new ApiResponse(201, review, "Review created successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Reviews For a Product
// GET /api/v1/reviews/product/:productId
// ─────────────────────────────────────────────────────────────────────────────
const getProductReviews = asyncHandler(async (req, res) => {
    const { reviews, total, page, totalPages } =
        await reviewService.getProductReviews(req.params.productId, req.query);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                reviews,
                "Reviews fetched successfully",
                { total, page, totalPages }
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Review By ID
// GET /api/v1/reviews/:id
// ─────────────────────────────────────────────────────────────────────────────
const getReviewById = asyncHandler(async (req, res) => {
    const review = await reviewService.getReviewById(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, review, "Review fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Get All Reviews  (admin — moderation dashboard)
// GET /api/v1/reviews
// ─────────────────────────────────────────────────────────────────────────────
const getAllReviews = asyncHandler(async (req, res) => {
    const { reviews, total, page, totalPages } =
        await reviewService.getAllReviews(req.query);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                reviews,
                "Reviews fetched successfully",
                { total, page, totalPages }
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// Update Review
// PATCH /api/v1/reviews/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateReview = asyncHandler(async (req, res) => {
    const review = await reviewService.updateReview(
        req.params.id,
        req.body,
        req.user
    );

    return res
        .status(200)
        .json(new ApiResponse(200, review, "Review updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Delete Review (Soft Delete)
// DELETE /api/v1/reviews/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteReview = asyncHandler(async (req, res) => {
    await reviewService.deleteReview(req.params.id, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Review deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createReview,
    getProductReviews,
    getReviewById,
    getAllReviews,
    updateReview,
    deleteReview
};
