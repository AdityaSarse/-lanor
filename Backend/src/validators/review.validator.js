const { body, param } = require("express-validator");

// ─────────────────────────────────────────────────────────────────────────────
// Create Review
// ─────────────────────────────────────────────────────────────────────────────
const createReviewValidator = [
    body("product")
        .notEmpty()
        .withMessage("Product is required")
        .isMongoId()
        .withMessage("Invalid product id"),

    body("order")
        .notEmpty()
        .withMessage("Order is required")
        .isMongoId()
        .withMessage("Invalid order id"),

    body("rating")
        .notEmpty()
        .withMessage("Rating is required")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),

    body("title")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Title cannot exceed 100 characters"),

    body("comment")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Comment cannot exceed 1000 characters"),

    body("images")
        .optional()
        .isArray({ max: 5 })
        .withMessage("A review can contain at most 5 images"),

    body("images.*.url")
        .optional()
        .isURL()
        .withMessage("Invalid image URL"),

    body("images.*.alt")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Image alt text cannot exceed 150 characters")
];

// ─────────────────────────────────────────────────────────────────────────────
// Update Review
// Only editable fields: rating, title, comment, images
// product / order / user cannot be changed after creation
// ─────────────────────────────────────────────────────────────────────────────
const updateReviewValidator = [
    body("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),

    body("title")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Title cannot exceed 100 characters"),

    body("comment")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Comment cannot exceed 1000 characters"),

    body("images")
        .optional()
        .isArray({ max: 5 })
        .withMessage("A review can contain at most 5 images"),

    body("images.*.url")
        .optional()
        .isURL()
        .withMessage("Invalid image URL"),

    body("images.*.alt")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Image alt text cannot exceed 150 characters")
];

// ─────────────────────────────────────────────────────────────────────────────
// Review Id
// ─────────────────────────────────────────────────────────────────────────────
const reviewIdValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid review id")
];

// ─────────────────────────────────────────────────────────────────────────────
// Product Id  (for GET /reviews/product/:productId)
// ─────────────────────────────────────────────────────────────────────────────
const productIdParamValidator = [
    param("productId")
        .isMongoId()
        .withMessage("Invalid product id")
];

module.exports = {
    createReviewValidator,
    updateReviewValidator,
    reviewIdValidator,
    productIdParamValidator
};
