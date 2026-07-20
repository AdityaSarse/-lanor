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

    body("slug")
        .trim()
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

    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .isFloat({ min: 0 })
        .withMessage("Price must be greater than or equal to 0"),

    body("discount")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Discount must be between 0 and 100"),

    body("currency")
        .optional()
        .trim()
        .isLength({ max: 10 })
        .withMessage("Currency is invalid"),

    body("images")
        .optional()
        .isArray()
        .withMessage("Images must be an array"),

    body("images.*.url")
        .optional()
        .isURL()
        .withMessage("Invalid image URL"),

    body("images.*.alt")
        .optional()
        .trim(),

    body("variants")
        .isArray({ min: 1 })
        .withMessage("At least one variant is required"),

    body("variants.*.color.name")
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
// TODO: Refactor into an explicit validator where each field is individually
//       marked .optional(). The .map() shortcut works for simple chains but
//       can produce unexpected behaviour as validation logic grows more complex.
const updateProductValidator = createProductValidator.map((validator) =>
    validator.optional()
);

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
