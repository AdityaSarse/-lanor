const { param } = require("express-validator");

// ─────────────────────────────────────────────────────────────────────────────
// Product Id
// Used for:
//   POST   /api/v1/wishlist/:productId   → add to wishlist
//   DELETE /api/v1/wishlist/:productId   → remove from wishlist
// ─────────────────────────────────────────────────────────────────────────────
const productIdValidator = [
    param("productId")
        .notEmpty()
        .withMessage("Product id is required")
        .isMongoId()
        .withMessage("Invalid product id")
];

module.exports = {
    productIdValidator
};
