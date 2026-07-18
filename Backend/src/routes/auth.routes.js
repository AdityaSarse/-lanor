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
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getMe);

module.exports = router;
