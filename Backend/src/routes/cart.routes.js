const express = require("express");
const router  = express.Router();

const cartController = require("../controllers/cart.controller");

const validate      = require("../middelwares/validation.middleware");
const { verifyJWT } = require("../middelwares/auth.middleware");

const {
    addToCartValidator,
    updateCartItemValidator,
    cartItemIdValidator
} = require("../validators/cart.validator");

// ─────────────────────────────────────────────────────────────────────────────
// All Cart Routes Are Protected
// The cart is personal to each user — verifyJWT on every route.
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/v1/cart
// Returns the user's cart with populated products and calculated totals.
// Stale (soft-deleted / inactive) products are auto-cleaned from the response.
router.get("/", verifyJWT, cartController.getCart);

// POST /api/v1/cart
// Adds a product variant to the cart. Merges quantity if the same variant exists.
router.post(
    "/",
    verifyJWT,
    addToCartValidator,
    validate,
    cartController.addToCart
);

// NOTE: Static DELETE / (clearCart) MUST come before DELETE /:itemId
//       to prevent Express matching the empty string as an itemId param.

// DELETE /api/v1/cart  — clears all items
router.delete("/", verifyJWT, cartController.clearCart);

// PATCH  /api/v1/cart/:itemId  — update quantity of a specific line item
router.patch(
    "/:itemId",
    verifyJWT,
    updateCartItemValidator,
    validate,
    cartController.updateCartItem
);

// DELETE /api/v1/cart/:itemId  — remove a single line item
router.delete(
    "/:itemId",
    verifyJWT,
    cartItemIdValidator,
    validate,
    cartController.removeCartItem
);

module.exports = router;
