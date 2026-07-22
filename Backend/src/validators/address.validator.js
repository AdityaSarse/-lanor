const { body, param } = require("express-validator");
const { ADDRESS_TYPES } = require("../constants/address.constants");

// ─────────────────────────────────────────────────────────────────────────────
// Create Address
// POST /api/v1/address
// ─────────────────────────────────────────────────────────────────────────────
const createAddressValidator = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid Indian phone number (must start with 6–9 and be 10 digits)"),

    body("alternatePhone")
        .optional({ values: "falsy" })
        .trim()
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid alternate phone number"),

    body("addressLine1")
        .trim()
        .notEmpty()
        .withMessage("Address line 1 is required")
        .isLength({ max: 255 })
        .withMessage("Address line 1 cannot exceed 255 characters"),

    body("addressLine2")
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage("Address line 2 cannot exceed 255 characters"),

    body("landmark")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Landmark cannot exceed 150 characters"),

    body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required"),

    body("state")
        .trim()
        .notEmpty()
        .withMessage("State is required"),

    // Optional — model defaults to "India"
    body("country")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Country cannot be an empty string"),

    // 6-digit Indian postal code
    body("postalCode")
        .trim()
        .notEmpty()
        .withMessage("Postal code is required")
        .matches(/^\d{6}$/)
        .withMessage("Postal code must be exactly 6 digits"),

    // NOTE: model field is `type` (not `addressType`) — keep this consistent
    body("type")
        .optional()
        .isIn(ADDRESS_TYPES)
        .withMessage(`Address type must be one of: ${ADDRESS_TYPES.join(", ")}`),

    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage("isDefault must be true or false")
];

// ─────────────────────────────────────────────────────────────────────────────
// Update Address
// PATCH /api/v1/address/:id
// All body fields are optional — only the fields sent will be updated.
// ─────────────────────────────────────────────────────────────────────────────
const updateAddressValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid address id"),

    body("fullName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Full name must be between 2 and 100 characters"),

    body("phone")
        .optional()
        .trim()
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid Indian phone number"),

    body("alternatePhone")
        .optional({ values: "falsy" })
        .trim()
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid alternate phone number"),

    body("addressLine1")
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage("Address line 1 cannot exceed 255 characters"),

    body("addressLine2")
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage("Address line 2 cannot exceed 255 characters"),

    body("landmark")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Landmark cannot exceed 150 characters"),

    body("city")
        .optional()
        .trim(),

    body("state")
        .optional()
        .trim(),

    body("country")
        .optional()
        .trim(),

    body("postalCode")
        .optional()
        .trim()
        .matches(/^\d{6}$/)
        .withMessage("Postal code must be exactly 6 digits"),

    body("type")
        .optional()
        .isIn(ADDRESS_TYPES)
        .withMessage(`Address type must be one of: ${ADDRESS_TYPES.join(", ")}`),

    body("isDefault")
        .optional()
        .isBoolean()
        .withMessage("isDefault must be true or false")
];

// ─────────────────────────────────────────────────────────────────────────────
// Address Id
// Used for:
//   GET    /api/v1/address/:id
//   DELETE /api/v1/address/:id
//   PATCH  /api/v1/address/:id
//   PATCH  /api/v1/address/:id/default
// ─────────────────────────────────────────────────────────────────────────────
const addressIdValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid address id")
];

module.exports = {
    createAddressValidator,
    updateAddressValidator,
    addressIdValidator
};
