const { body } = require("express-validator");

// ─── Reusable password rule chain ─────────────────────────────────────────────
// Used by both registerValidator and resetPasswordValidator so the rules
// stay consistent and are only defined once.
//
// `field` defaults to "password" but can be overridden (e.g. "newPassword")
const passwordRules = (field = "password") =>
    body(field)
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Password must contain at least one special character");

// ─── Auth Validators ──────────────────────────────────────────────────────────
// Each export is an array passed directly as route middleware before validate.
//
// Usage:
//   router.post("/register", registerValidator, validate, registerUser);

// ── Register ──────────────────────────────────────────────────────────────────
const registerValidator = [
    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ max: 50 })
        .withMessage("First name cannot exceed 50 characters"),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ max: 50 })
        .withMessage("Last name cannot exceed 50 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .isLength({ max: 254 }) // RFC 5321 maximum email length
        .withMessage("Email cannot exceed 254 characters")
        .normalizeEmail(),

    passwordRules(), // "password" field — reusable chain

    body("phone")
        .optional()
        .trim()
        .isMobilePhone("en-IN")
        .withMessage("Please provide a valid Indian mobile number")
];

// ── Login ─────────────────────────────────────────────────────────────────────
// Password is not strength-checked on login — only presence matters.
// Never tell the user which specific rule their stored password violates.
const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
];

// ── Forgot Password ───────────────────────────────────────────────────────────
const forgotPasswordValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail()
];

// ── Reset Password ────────────────────────────────────────────────────────────
const resetPasswordValidator = [
    body("token")
        .trim()
        .notEmpty()
        .withMessage("Reset token is required"),

    passwordRules("newPassword") // "newPassword" field — same strength rules
];

module.exports = {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
};
