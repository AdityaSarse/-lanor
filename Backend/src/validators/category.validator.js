const { body, param } = require("express-validator");

// ─────────────────────────────────────────────────────────────────────────────
// Create Category
// ─────────────────────────────────────────────────────────────────────────────
const createCategoryValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Category name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Category name must be between 2 and 100 characters"),

    body("slug")
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Slug is required")
        .isSlug()
        .withMessage("Invalid slug"),

    body("parent")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Invalid parent category id"),

    body("level")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Level must be a positive integer"),

    body("displayOrder")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Display order must be a positive integer"),

    body("image.url")
        .optional()
        .isURL()
        .withMessage("Invalid image URL"),

    body("image.alt")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Image alt text cannot exceed 150 characters"),

    body("icon")
        .optional()
        .trim(),

    body("description")
        .optional()
        .trim(),

    body("isFeatured")
        .optional()
        .isBoolean()
        .withMessage("isFeatured must be boolean"),

    body("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Invalid status"),

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

// ─────────────────────────────────────────────────────────────────────────────
// Update Category
// ─────────────────────────────────────────────────────────────────────────────
const updateCategoryValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Category name must be between 2 and 100 characters"),

    body("slug")
        .optional()
        .trim()
        .toLowerCase()
        .isSlug()
        .withMessage("Invalid slug"),

    body("parent")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Invalid parent category id"),

    body("level")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Level must be a positive integer"),

    body("displayOrder")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Display order must be a positive integer"),

    body("image.url")
        .optional()
        .isURL()
        .withMessage("Invalid image URL"),

    body("image.alt")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Image alt text cannot exceed 150 characters"),

    body("icon")
        .optional()
        .trim(),

    body("description")
        .optional()
        .trim(),

    body("isFeatured")
        .optional()
        .isBoolean()
        .withMessage("isFeatured must be boolean"),

    body("status")
        .optional()
        .isIn(["active", "inactive"])
        .withMessage("Invalid status"),

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

// ─────────────────────────────────────────────────────────────────────────────
// Category Id
// ─────────────────────────────────────────────────────────────────────────────
const categoryIdValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid category id")
];

module.exports = {
    createCategoryValidator,
    updateCategoryValidator,
    categoryIdValidator
};
