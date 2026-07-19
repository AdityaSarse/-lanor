const express = require("express");

const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    refreshAccessToken,
    forgotPassword,
    resetPassword
} = require("../controllers/auth.controller");

const { verifyJWT } = require("../middelwares/auth.middleware");
const validate = require("../middelwares/validation.middleware");

const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require("../validators/auth.validator");

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/register",       registerValidator,       validate, registerUser);
router.post("/login",          loginValidator,          validate, loginUser);
router.post("/refresh-token",  refreshAccessToken);
router.post("/forgot-password", forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password", resetPasswordValidator,  validate, resetPassword);

// ── Protected routes ──────────────────────────────────────────────────────────
router.post("/logout", verifyJWT, logoutUser);
router.get("/me",      verifyJWT, getMe);

module.exports = router;
