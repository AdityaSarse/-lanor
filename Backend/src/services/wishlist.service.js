const Wishlist = require("../models/wishlist.model");
const Product  = require("../models/products.model");
const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Populates products in the wishlist with fields needed for a product card. */
const PRODUCT_POPULATE = {
    path:   "products.product",
    select: "name slug price images averageRating reviewCount status deletedAt"
};

// ─────────────────────────────────────────────────────────────────────────────
// Wishlist Service
// ─────────────────────────────────────────────────────────────────────────────

// ─── addToWishlist ────────────────────────────────────────────────────────────
/**
 * Adds a product to the user's wishlist.
 *
 * Business rules:
 *   1. Product exists and is not soft-deleted.
 *   2. Product status is "active" (not draft / inactive).
 *   3. Find the user's wishlist, create one if it doesn't exist yet.
 *   4. Prevent duplicate — throw 409 if already in the list.
 *   5. Push the product and save.
 *   6. Return the populated, updated wishlist.
 *
 * @param {string} userId    - req.user._id from verifyJWT.
 * @param {string} productId - Route param :productId.
 * @returns {Promise<Wishlist>}
 */
const addToWishlist = async (userId, productId) => {
    // ── 1. Product exists & not soft-deleted ──────────────────────────────────
    const product = await Product.findOne({ _id: productId, deletedAt: null });
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // ── 2. Product must be active ─────────────────────────────────────────────
    if (product.status !== "active") {
        throw new ApiError(400, "This product is not available");
    }

    // ── 3. Find or create wishlist ────────────────────────────────────────────
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    // ── 4. Duplicate prevention ───────────────────────────────────────────────
    // Check if product already in the list (can't use $addToSet on sub-docs)
    const alreadyAdded = wishlist.products.some(
        (item) => item.product.toString() === productId.toString()
    );
    if (alreadyAdded) {
        throw new ApiError(409, "Product is already in your wishlist");
    }

    // ── 5. Add product ────────────────────────────────────────────────────────
    wishlist.products.push({ product: productId, addedAt: new Date() });
    await wishlist.save();

    // ── 6. Return populated wishlist ──────────────────────────────────────────
    return Wishlist.findById(wishlist._id).populate(PRODUCT_POPULATE).lean();
};

// ─── getWishlist ──────────────────────────────────────────────────────────────
/**
 * Returns the user's wishlist with populated product details.
 * Filters out soft-deleted products from the response — they stay in the DB
 * but are invisible to the frontend until the product is restored.
 *
 * Supports pagination over the products array.
 *
 * @param {string} userId  - req.user._id from verifyJWT.
 * @param {Object} options - { page, limit } from req.query.
 * @returns {Promise<{products, total, page, totalPages, wishlistCount}>}
 */
const getWishlist = async (userId, options = {}) => {
    const { page = 1, limit = 20 } = options;

    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    // Find or create an empty wishlist — users should always get a valid response
    let wishlist = await Wishlist.findOne({ user: userId })
        .populate(PRODUCT_POPULATE)
        .lean();

    if (!wishlist) {
        return {
            products:      [],
            total:         0,
            page:          pageNum,
            totalPages:    0,
            wishlistCount: 0
        };
    }

    // Filter out entries where the product was soft-deleted or made inactive
    // after it was added to the wishlist
    const liveProducts = wishlist.products.filter(
        (item) =>
            item.product &&
            item.product.deletedAt === null &&
            item.product.status   === "active"
    );

    const total     = liveProducts.length;
    const skip      = (pageNum - 1) * limitNum;
    const paginated = liveProducts.slice(skip, skip + limitNum);

    return {
        products:      paginated,
        total,
        page:          pageNum,
        totalPages:    Math.ceil(total / limitNum),
        wishlistCount: total
    };
};

// ─── removeFromWishlist ───────────────────────────────────────────────────────
/**
 * Removes a product from the user's wishlist.
 * Throws 404 if the wishlist doesn't exist or the product wasn't in it.
 *
 * @param {string} userId    - req.user._id from verifyJWT.
 * @param {string} productId - Route param :productId.
 * @returns {Promise<Wishlist>} The updated, populated wishlist.
 */
const removeFromWishlist = async (userId, productId) => {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        throw new ApiError(404, "Wishlist not found");
    }

    const initialLength = wishlist.products.length;

    // Filter out the product to remove
    wishlist.products = wishlist.products.filter(
        (item) => item.product.toString() !== productId.toString()
    );

    // If nothing was removed, the product wasn't in the list
    if (wishlist.products.length === initialLength) {
        throw new ApiError(404, "Product not found in your wishlist");
    }

    await wishlist.save();

    return Wishlist.findById(wishlist._id).populate(PRODUCT_POPULATE).lean();
};

// ─── clearWishlist ────────────────────────────────────────────────────────────
/**
 * Removes all products from the user's wishlist.
 * Useful for a "Clear All" button on the wishlist page.
 *
 * @param {string} userId - req.user._id from verifyJWT.
 * @returns {Promise<void>}
 */
const clearWishlist = async (userId) => {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        // No wishlist = already empty — treat as success
        return;
    }

    wishlist.products = [];
    await wishlist.save();
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    clearWishlist
};
