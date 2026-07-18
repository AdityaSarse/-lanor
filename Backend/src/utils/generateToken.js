const JWT = require("jsonwebtoken");
const userModel = require("../models/users.models");
const ApiError = require("./ApiError");

// ─── generateTokens ───────────────────────────────────────────────────────────
// Centralised token generation used by:
//   - registerUser  (after account creation)
//   - loginUser     (after credential verification)
//   - refreshAccessToken (after refresh token rotation)
//
// What it does:
//   1. Signs a short-lived access token  (payload: id, role)
//   2. Signs a long-lived refresh token  (payload: id only)
//   3. Persists the refresh token on the User document
//   4. Returns { accessToken, refreshToken }
//
// Required environment variables:
//   ACCESS_TOKEN_SECRET=<secret>
//   REFRESH_TOKEN_SECRET=<secret>
//   ACCESS_TOKEN_EXPIRY=15m
//   REFRESH_TOKEN_EXPIRY=7d

const generateTokens = async (userId) => {
    // Fetch the user — we need role for the access token payload
    const user = await userModel.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found while generating tokens");
    }

    // ── Access token ──────────────────────────────────────────────────────────
    // Short-lived — carries identity and role for every protected request.
    // Never stored in the database.
    const accessToken = JWT.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m"
        }
    );

    // ── Refresh token ─────────────────────────────────────────────────────────
    // Long-lived — used only to obtain a new access token.
    // Stored in the database so it can be invalidated on logout.
    // Payload is minimal (id only) — no role, no sensitive data.
    const refreshToken = JWT.sign(
        {
            id: user._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d"
        }
    );

    // ── Persist refresh token ─────────────────────────────────────────────────
    // validateBeforeSave: false — skip schema validation on unrelated fields
    // (e.g. required fields that aren't part of this update)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

module.exports = generateTokens;
