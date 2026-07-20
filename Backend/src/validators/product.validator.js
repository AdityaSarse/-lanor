const { body, param } = require("express-validator");

// ─────────────────────────────────────────────────────────────────────────────
// Product Validators
// ─────────────────────────────────────────────────────────────────────────────

// ─── Create Product ───────────────────────────────────────────────────────────
const createProductValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required")
        .isLength({ min: 3, max: 150 })
        .withMessage("Product name must be between 3 and 150 characters"),

    // Normalized to lowercase before slug-format check
    body("slug")
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Slug is required")
        .isSlug()
        .withMessage("Invalid slug format"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ min: 10 })
        .withMessage("Description must be at least 10 characters"),

    body("gender")
        .notEmpty()
        .withMessage("Gender is required")
        .isIn(["Men", "Women", "Unisex", "Kids"])
        .withMessage("Invalid gender"),

    body("category")
        .notEmpty()
        .withMessage("Category is required")
        .isMongoId()
        .withMessage("Invalid category id"),

    body("subCategory")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Invalid sub category id"),

    body("brand")
        .notEmpty()
        .withMessage("Brand is required")
        .isMongoId()
        .withMessage("Invalid brand id"),

    // Price must be a real positive value — ₹0 products are not allowed
    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .isFloat({ gt: 0 })
        .withMessage("Price must be greater than 0"),

    body("discount")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Discount must be between 0 and 100"),

    // Validated against supported currencies rather than a loose length check
    body("currency")
        .optional()
        .trim()
        .isIn(["INR", "USD", "EUR"])
        .withMessage("Currency must be one of: INR, USD, EUR"),

    // Every product must have at least one image
    body("images")
        .isArray({ min: 1 })
        .withMessage("At least one product image is required"),

    body("images.*.url")
        .notEmpty()
        .withMessage("Image URL is required")
        .isURL()
        .withMessage("Invalid image URL"),

    body("images.*.alt")
        .optional()
        .trim(),

    body("variants")
        .isArray({ min: 1 })
        .withMessage("At least one variant is required"),

    // Trimmed before notEmpty so whitespace-only strings are caught
    body("variants.*.color.name")
        .trim()
        .notEmpty()
        .withMessage("Color name is required"),

    body("variants.*.color.hex")
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage("Invalid hex color"),

    body("variants.*.sizes")
        .isArray({ min: 1 })
        .withMessage("At least one size is required"),

    body("variants.*.sizes.*.size")
        .isIn(["XS", "S", "M", "L", "XL", "XXL", "XXXL"])
        .withMessage("Invalid size"),

    body("variants.*.sizes.*.stock")
        .notEmpty()
        .withMessage("Stock is required")
        .isInt({ min: 0 })
        .withMessage("Stock cannot be negative"),

    body("material")
        .optional()
        .trim(),

    body("fit")
        .optional()
        .isIn(["Slim", "Regular", "Relaxed", "Oversized", ""])
        .withMessage("Invalid fit"),

    body("tags")
        .optional()
        .isArray()
        .withMessage("Tags must be an array"),

    // Per-item tag validation — trimmed, non-empty, max 30 chars
    body("tags.*")
        .trim()
        .notEmpty()
        .withMessage("Tag cannot be empty")
        .isLength({ max: 30 })
        .withMessage("Each tag cannot exceed 30 characters"),

    body("status")
        .optional()
        .isIn(["active", "inactive", "out_of_stock"])
        .withMessage("Invalid status"),

    body("isPublished")
        .optional()
        .isBoolean()
        .withMessage("isPublished must be boolean"),

    body("isFeatured")
        .optional()
        .isBoolean()
        .withMessage("isFeatured must be boolean"),

    body("seo.title")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("SEO title cannot exceed 150 characters"),

    body("seo.description")
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage("SEO description cannot exceed 300 characters")
];

// ─── Update Product ───────────────────────────────────────────────────────────
// Explicit per-field optionals — avoids the fragile .map() approach that can
// produce unexpected behaviour as validation chains grow more complex.
const updateProductValidator = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Product name cannot be empty")
        .isLength({ min: 3, max: 150 })
        .withMessage("Product name must be between 3 and 150 characters"),

    body("slug")
        .optional()
        .trim()
        .toLowerCase()
        .isSlug()
        .withMessage("Invalid slug format"),

    body("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty")
        .isLength({ min: 10 })
        .withMessage("Description must be at least 10 characters"),

    body("gender")
        .optional()
        .isIn(["Men", "Women", "Unisex", "Kids"])
        .withMessage("Invalid gender"),

    body("category")
        .optional()
        .isMongoId()
        .withMessage("Invalid category id"),

    body("subCategory")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Invalid sub category id"),

    body("brand")
        .optional()
        .isMongoId()
        .withMessage("Invalid brand id"),

    body("price")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("Price must be greater than 0"),

    body("discount")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Discount must be between 0 and 100"),

    body("currency")
        .optional()
        .trim()
        .isIn(["INR", "USD", "EUR"])
        .withMessage("Currency must be one of: INR, USD, EUR"),

    body("images")
        .optional()
        .isArray({ min: 1 })
        .withMessage("At least one product image is required"),

    body("images.*.url")
        .optional()
        .isURL()
        .withMessage("Invalid image URL"),

    body("images.*.alt")
        .optional()
        .trim(),

    body("variants")
        .optional()
        .isArray({ min: 1 })
        .withMessage("At least one variant is required"),

    body("variants.*.color.name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Color name cannot be empty"),

    body("variants.*.color.hex")
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage("Invalid hex color"),

    body("variants.*.sizes")
        .optional()
        .isArray({ min: 1 })
        .withMessage("At least one size is required"),

    body("variants.*.sizes.*.size")
        .optional()
        .isIn(["XS", "S", "M", "L", "XL", "XXL", "XXXL"])
        .withMessage("Invalid size"),

    body("variants.*.sizes.*.stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Stock cannot be negative"),

    body("material")
        .optional()
        .trim(),

    body("fit")
        .optional()
        .isIn(["Slim", "Regular", "Relaxed", "Oversized", ""])
        .withMessage("Invalid fit"),

    body("tags")
        .optional()
        .isArray()
        .withMessage("Tags must be an array"),

    body("tags.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Tag cannot be empty")
        .isLength({ max: 30 })
        .withMessage("Each tag cannot exceed 30 characters"),

    body("status")
        .optional()
        .isIn(["active", "inactive", "out_of_stock"])
        .withMessage("Invalid status"),

    body("isPublished")
        .optional()
        .isBoolean()
        .withMessage("isPublished must be boolean"),

    body("isFeatured")
        .optional()
        .isBoolean()
        .withMessage("isFeatured must be boolean"),

    body("seo.title")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("SEO title cannot exceed 150 characters"),

    body("seo.description")
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage("SEO description cannot exceed 300 characters")
];

// ─── Product Id ───────────────────────────────────────────────────────────────
const productIdValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid product id")
];

module.exports = {
    createProductValidator,
    updateProductValidator,
    productIdValidator
};
