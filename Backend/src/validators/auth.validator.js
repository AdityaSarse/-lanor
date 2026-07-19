const { body } = require("express-validator");

// ─── Auth Validators ──────────────────────────────────────────────────────────
// express-validator rule arrays for each auth route.
// Each export is an array of rules passed directly as route middleware.
//
// Usage:
//   router.post("/register", registerValidator, validate, registerUser);
//   router.post("/login",    loginValidator,    validate, loginUser);

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
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number"),

    body("phone")
        .optional()
        .trim()
        .isMobilePhone()
        .withMessage("Please provide a valid phone number")
];

// ── Login ─────────────────────────────────────────────────────────────────────
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

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
];

module.exports = {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
};
