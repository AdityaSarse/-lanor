const { body, param } = require("express-validator");
const { DISCOUNT_TYPES } = require("../constants/coupon.constants");

// ─────────────────────────────────────────────────────────────────────────────
// Coupon Validators
// ─────────────────────────────────────────────────────────────────────────────

// ─── Create Coupon (Admin) ────────────────────────────────────────────────────
const createCouponValidator = [
    // Normalised to uppercase at the validator layer so every downstream layer
    // (service, logs, errors) sees WELCOME20 rather than welcome20.
    // The model's `uppercase: true` acts as a final safety net.
    body("code")
        .trim()
        .notEmpty()
        .withMessage("Coupon code is required")
        .customSanitizer(value => value.toUpperCase())
        .isLength({ min: 3, max: 30 })
        .withMessage("Coupon code must be between 3 and 30 characters")
        .matches(/^[A-Z0-9_-]+$/)
        .withMessage("Coupon code may only contain letters, numbers, hyphens, and underscores"),

    body("discountType")
        .notEmpty()
        .withMessage("Discount type is required")
        .isIn(DISCOUNT_TYPES)
        .withMessage(`Discount type must be one of: ${DISCOUNT_TYPES.join(", ")}`),

    body("discountValue")
        .notEmpty()
        .withMessage("Discount value is required")
        .isFloat({ gt: 0 })
        .withMessage("Discount value must be greater than 0"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage("Description cannot exceed 300 characters"),

    body("minimumOrder")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Minimum order value cannot be negative"),

    body("maximumDiscount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Maximum discount cannot be negative"),

    body("usageLimit")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Usage limit cannot be negative"),

    body("usagePerUser")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Usage per user must be at least 1"),

    // Format-only check — the model cross-validates validUntil > validFrom
    body("validFrom")
        .notEmpty()
        .withMessage("Valid-from date is required")
        .isISO8601()
        .withMessage("validFrom must be a valid ISO 8601 date"),

    body("validUntil")
        .notEmpty()
        .withMessage("Valid-until date is required")
        .isISO8601()
        .withMessage("validUntil must be a valid ISO 8601 date"),

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),

    // ─── applicableTo (optional, v2) ──────────────────────────────────────────
    body("applicableTo.products")
        .optional()
        .isArray()
        .withMessage("applicableTo.products must be an array"),

    body("applicableTo.products.*")
        .optional()
        .isMongoId()
        .withMessage("Each product id must be a valid MongoId"),

    body("applicableTo.categories")
        .optional()
        .isArray()
        .withMessage("applicableTo.categories must be an array"),

    body("applicableTo.categories.*")
        .optional()
        .isMongoId()
        .withMessage("Each category id must be a valid MongoId"),

    body("applicableTo.brands")
        .optional()
        .isArray()
        .withMessage("applicableTo.brands must be an array"),

    body("applicableTo.brands.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Brand name cannot be empty")
];

// ─── Update Coupon (Admin) ────────────────────────────────────────────────────
// param("id") is included here so the route param is validated alongside the
// body — no need to compose two separate validator arrays in the router.
// Every body field is optional — only validate what was sent.
// Explicit per-field optionals are used (not .map()) to keep chains readable
// as they grow more complex over time.
const updateCouponValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid coupon id"),

    body("code")
        .optional()
        .trim()
        .customSanitizer(value => value.toUpperCase())
        .isLength({ min: 3, max: 30 })
        .withMessage("Coupon code must be between 3 and 30 characters")
        .matches(/^[A-Z0-9_-]+$/)
        .withMessage("Coupon code may only contain letters, numbers, hyphens, and underscores"),

    body("discountType")
        .optional()
        .isIn(DISCOUNT_TYPES)
        .withMessage(`Discount type must be one of: ${DISCOUNT_TYPES.join(", ")}`),

    body("discountValue")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("Discount value must be greater than 0"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage("Description cannot exceed 300 characters"),

    body("minimumOrder")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Minimum order value cannot be negative"),

    body("maximumDiscount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Maximum discount cannot be negative"),

    body("usageLimit")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Usage limit cannot be negative"),

    body("usagePerUser")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Usage per user must be at least 1"),

    body("validFrom")
        .optional()
        .isISO8601()
        .withMessage("validFrom must be a valid ISO 8601 date"),

    body("validUntil")
        .optional()
        .isISO8601()
        .withMessage("validUntil must be a valid ISO 8601 date"),

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),

    body("applicableTo.products")
        .optional()
        .isArray()
        .withMessage("applicableTo.products must be an array"),

    body("applicableTo.products.*")
        .optional()
        .isMongoId()
        .withMessage("Each product id must be a valid MongoId"),

    body("applicableTo.categories")
        .optional()
        .isArray()
        .withMessage("applicableTo.categories must be an array"),

    body("applicableTo.categories.*")
        .optional()
        .isMongoId()
        .withMessage("Each category id must be a valid MongoId"),

    body("applicableTo.brands")
        .optional()
        .isArray()
        .withMessage("applicableTo.brands must be an array"),

    body("applicableTo.brands.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Brand name cannot be empty")
];

// ─── Coupon Id (Admin) ────────────────────────────────────────────────────────
const couponIdValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid coupon id")
];

// ─── Validate Coupon (Customer) ───────────────────────────────────────────────
// Called at checkout — the customer sends the coupon code and their cart subtotal.
// The service layer does the actual business-logic checks (expiry, usage, minimum
// order). This validator only ensures the payload is well-formed.
//
// Accepted shapes:
//   { "code": "WELCOME20" }
//   { "code": "WELCOME20", "subtotal": 2500 }
const validateCouponValidator = [
    body("code")
        .trim()
        .notEmpty()
        .withMessage("Coupon code is required")
        .customSanitizer(value => value.toUpperCase())
        .isLength({ min: 3, max: 30 })
        .withMessage("Coupon code must be between 3 and 30 characters"),

    // subtotal is optional here — the service can derive it from the cart if absent.
    // When provided, it must be a non-negative number so we can check minimumOrder.
    body("subtotal")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Subtotal must be a non-negative number")
];

module.exports = {
    createCouponValidator,
    updateCouponValidator,
    couponIdValidator,
    validateCouponValidator
};
