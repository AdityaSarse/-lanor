const asyncHandler  = require("../utils/asyncHandler");
const ApiResponse   = require("../utils/ApiResponse");
const cartService   = require("../services/cart.service");

// ─────────────────────────────────────────────────────────────────────────────
// Get User Cart
// GET /api/v1/cart
// ─────────────────────────────────────────────────────────────────────────────
const getCart = asyncHandler(async (req, res) => {
    const { cart, totals } = await cartService.getCart(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Cart fetched successfully", totals));
});

// ─────────────────────────────────────────────────────────────────────────────
// Add Item to Cart
// POST /api/v1/cart
// ─────────────────────────────────────────────────────────────────────────────
const addToCart = asyncHandler(async (req, res) => {
    const { cart, totals } = await cartService.addToCart(req.user._id, req.body);

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Product added to cart successfully", totals));
});

// ─────────────────────────────────────────────────────────────────────────────
// Update Cart Item Quantity
// PATCH /api/v1/cart/:itemId
// ─────────────────────────────────────────────────────────────────────────────
const updateCartItem = asyncHandler(async (req, res) => {
    const { cart, totals } = await cartService.updateCartItem(
        req.user._id,
        req.params.itemId,
        req.body.quantity
    );

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Cart updated successfully", totals));
});

// ─────────────────────────────────────────────────────────────────────────────
// Remove Cart Item
// DELETE /api/v1/cart/:itemId
// ─────────────────────────────────────────────────────────────────────────────
const removeCartItem = asyncHandler(async (req, res) => {
    const { cart, totals } = await cartService.removeCartItem(
        req.user._id,
        req.params.itemId
    );

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Item removed from cart successfully", totals));
});

// ─────────────────────────────────────────────────────────────────────────────
// Clear Cart
// DELETE /api/v1/cart
// ─────────────────────────────────────────────────────────────────────────────
const clearCart = asyncHandler(async (req, res) => {
    await cartService.clearCart(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Cart cleared successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
