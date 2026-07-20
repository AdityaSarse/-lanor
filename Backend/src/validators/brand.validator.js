const { body, param } = require("express-validator");

// ─────────────────────────────────────────────────────────────────────────────
// Create Brand
// ─────────────────────────────────────────────────────────────────────────────
const createBrandValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Brand name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Brand name must be between 2 and 100 characters"),

    body("slug")
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Slug is required")
        .isSlug()
        .withMessage("Invalid slug"),

    body("logo.url")
        .optional()
        .isURL()
        .withMessage("Invalid logo URL"),

    body("logo.alt")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Logo alt text cannot exceed 150 characters"),

    body("description")
        .optional()
        .trim(),

    body("website")
        .optional()
        .isURL()
        .withMessage("Invalid website URL"),

    body("country")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Country name cannot exceed 100 characters"),

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
// Update Brand
// ─────────────────────────────────────────────────────────────────────────────
const updateBrandValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Brand name must be between 2 and 100 characters"),

    body("slug")
        .optional()
        .trim()
        .toLowerCase()
        .isSlug()
        .withMessage("Invalid slug"),

    body("logo.url")
        .optional()
        .isURL()
        .withMessage("Invalid logo URL"),

    body("logo.alt")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Logo alt text cannot exceed 150 characters"),

    body("description")
        .optional()
        .trim(),

    body("website")
        .optional()
        .isURL()
        .withMessage("Invalid website URL"),

    body("country")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Country name cannot exceed 100 characters"),

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
// Brand Id
// ─────────────────────────────────────────────────────────────────────────────
const brandIdValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid brand id")
];

module.exports = {
    createBrandValidator,
    updateBrandValidator,
    brandIdValidator
};
