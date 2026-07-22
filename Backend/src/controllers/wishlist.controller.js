const asyncHandler     = require("../utils/asyncHandler");
const ApiResponse      = require("../utils/ApiResponse");
const wishlistService  = require("../services/wishlist.service");

// ─────────────────────────────────────────────────────────────────────────────
// Get Wishlist
// GET /api/v1/wishlist
// ─────────────────────────────────────────────────────────────────────────────
const getWishlist = asyncHandler(async (req, res) => {
    const { products, total, page, totalPages, wishlistCount } =
        await wishlistService.getWishlist(req.user._id, req.query);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                products,
                "Wishlist fetched successfully",
                { total, page, totalPages, wishlistCount }
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// Add To Wishlist
// POST /api/v1/wishlist/:productId
// ─────────────────────────────────────────────────────────────────────────────
const addToWishlist = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.addToWishlist(
        req.user._id,
        req.params.productId
    );

    return res
        .status(200)
        .json(new ApiResponse(200, wishlist, "Product added to wishlist"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Remove From Wishlist
// DELETE /api/v1/wishlist/:productId
// ─────────────────────────────────────────────────────────────────────────────
const removeFromWishlist = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.removeFromWishlist(
        req.user._id,
        req.params.productId
    );

    return res
        .status(200)
        .json(new ApiResponse(200, wishlist, "Product removed from wishlist"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Clear Wishlist
// DELETE /api/v1/wishlist
// ─────────────────────────────────────────────────────────────────────────────
const clearWishlist = asyncHandler(async (req, res) => {
    await wishlistService.clearWishlist(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Wishlist cleared successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
};
