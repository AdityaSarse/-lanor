const { body, param } = require("express-validator");
const { PRODUCT_SIZES } = require("../constants/product.constants");

// ─────────────────────────────────────────────────────────────────────────────
// Add Item to Cart
// POST /api/v1/cart
// ─────────────────────────────────────────────────────────────────────────────
const addToCartValidator = [
    body("product")
        .notEmpty()
        .withMessage("Product id is required")
        .isMongoId()
        .withMessage("Invalid product id"),

    body("quantity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),

    body("size")
        .notEmpty()
        .withMessage("Size is required")
        .isIn(PRODUCT_SIZES)
        .withMessage(`Invalid size. Must be one of: ${PRODUCT_SIZES.join(", ")}`),

    body("color.name")
        .notEmpty()
        .withMessage("Color name is required")
        .trim(),

    body("color.hex")
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage("Invalid hex color (e.g. #FFF or #FFFFFF)")
];

// ─────────────────────────────────────────────────────────────────────────────
// Update Cart Item Quantity
// PATCH /api/v1/cart/:itemId
// Only quantity can be updated — product, size, and color are immutable.
// If the user wants a different variant, they remove the item and re-add it.
// ─────────────────────────────────────────────────────────────────────────────
const updateCartItemValidator = [
    param("itemId")
        .isMongoId()
        .withMessage("Invalid cart item id"),

    body("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1")
];

// ─────────────────────────────────────────────────────────────────────────────
// Remove Cart Item
// DELETE /api/v1/cart/:itemId
// ─────────────────────────────────────────────────────────────────────────────
const cartItemIdValidator = [
    param("itemId")
        .isMongoId()
        .withMessage("Invalid cart item id")
];

module.exports = {
    addToCartValidator,
    updateCartItemValidator,
    cartItemIdValidator
};
