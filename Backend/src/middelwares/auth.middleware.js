const JWT = require("jsonwebtoken");
const userModel = require("../models/users.models");

// ─────────────────────────────────────────────────────────────────────────────
// verifyJWT
//
// Authentication middleware — confirms the caller is a valid, active user.
// Attaches the full user document (minus password) to req.user.
//
// Token lookup order:
//   1. HttpOnly cookie  → req.cookies.accessToken
//   2. Authorization header → Bearer <token>
// ─────────────────────────────────────────────────────────────────────────────
const verifyJWT = async (req, res, next) => {
    try {
        // ── 1. Extract token ──────────────────────────────────────────────────
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // ── 2. Verify signature & expiry ──────────────────────────────────────
        // Only use ACCESS_TOKEN_SECRET — no fallback.
        // A missing env var should fail loudly in development, not silently.
        const decodedToken = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // ── 3. Load user ──────────────────────────────────────────────────────
        const user = await userModel
            .findById(decodedToken.id)
            .select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // ── 4. Check user status ──────────────────────────────────────────────
        // Reject banned or soft-deleted accounts even if their token is valid.
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended"
            });
        }

        if (user.deletedAt) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // ── 5. Attach user and continue ───────────────────────────────────────
        req.user = user;
        next();
    } catch (error) {
        // Log the real error internally — never expose JWT internals to clients.
        console.error("[verifyJWT]", error.name, error.message);

        // Return a specific message for token expiry so the client can
        // silently refresh; everything else is a generic "Unauthorized".
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired"
            });
        }

        // JsonWebTokenError, NotBeforeError, etc.
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// verifyRole
//
// Authorization middleware — must be used AFTER verifyJWT.
// Usage:
//   router.post("/products", verifyJWT, verifyRole("admin"), createProduct);
//   router.delete("/users/:id", verifyJWT, verifyRole("admin", "superadmin"), deleteUser);
// ─────────────────────────────────────────────────────────────────────────────
const verifyRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You do not have permission to perform this action"
            });
        }
        next();
    };
};

module.exports = { verifyJWT, verifyRole };
