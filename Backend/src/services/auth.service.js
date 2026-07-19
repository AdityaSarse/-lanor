const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userModel = require("../models/users.models");
const generateTokens = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SERVICE
//
// Contains all authentication business logic.
// Rules:
//   ✅ Talks to the database
//   ✅ Applies business rules
//   ✅ Throws ApiError on failure
//   ✅ Calls utilities (generateTokens, bcrypt, crypto)
//   ❌ Never accesses req or res
//   ❌ Never sets cookies
//   ❌ Never sends JSON responses
// ─────────────────────────────────────────────────────────────────────────────

// ── registerUser ──────────────────────────────────────────────────────────────
// 1. Checks email uniqueness
// 2. Hashes password
// 3. Creates user
// 4. Generates tokens
// Returns: { user, accessToken, refreshToken }
//
// Does NOT: set cookies, send response, or access req/res
const registerUser = async ({ firstName, lastName, email, password, phone, role = "customer" }) => {
    try {
        // Duplicate email check
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw new ApiError(409, "An account with this email already exists");
        }

        // Hash password — bcrypt auto-generates a salt with cost factor 12
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await userModel.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role
        });

        const { accessToken, refreshToken } = await generateTokens(user._id);

        // Re-fetch to get a clean document without sensitive fields.
        // create() returns the document with password and refreshToken still present.
        const createdUser = await userModel
            .findById(user._id)
            .select("-password -refreshToken");

        return { user: createdUser, accessToken, refreshToken };
    } catch (error) {
        // Re-throw ApiErrors as-is (e.g. the 409 above)
        if (error instanceof ApiError) throw error;

        // Wrap any unexpected failure (DB down, bcrypt throws, etc.)
        throw new ApiError(500, "Failed to register user");
    }
};

// ── loginUser ─────────────────────────────────────────────────────────────────
// 1. Finds user by email
// 2. Compares password
// 3. Checks account status
// 4. Updates lastLogin
// 5. Generates tokens
// Returns: { user, accessToken, refreshToken }
const loginUser = async ({ email, password }) => {
    // Find user — include password for comparison (excluded by default via select)
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        // Same message as wrong password — prevents email enumeration
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Reject blocked or deleted accounts before generating tokens
    if (user.status === "blocked") {
        throw new ApiError(403, "Your account has been suspended");
    }
    if (user.status === "deleted") {
        throw new ApiError(401, "Invalid email or password");
    }

    // Stamp last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = await generateTokens(user._id);

    const safeUser = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
    };

    return { user: safeUser, accessToken, refreshToken };
};

// ── logoutUser ────────────────────────────────────────────────────────────────
// Invalidates the refresh token stored in the database.
// The access token expires naturally (it's short-lived).
const logoutUser = async (userId) => {
    await userModel.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );
};

// ── refreshAccessToken ────────────────────────────────────────────────────────
// 1. Verifies the incoming refresh token's signature
// 2. Compares it against the token stored in the DB (rotation check)
// 3. Issues a new access + refresh token pair (token rotation)
// Returns: { accessToken, refreshToken }
const refreshAccessToken = async (incomingRefreshToken) => {
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized");
    }

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Refresh token expired. Please log in again.");
        }
        throw new ApiError(401, "Unauthorized");
    }

    const user = await userModel.findById(decoded.id).select("refreshToken status");
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    // Rotation check — if the incoming token doesn't match what's in the DB,
    // a token reuse attack may be underway. Reject and force re-login.
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token has already been used or invalidated");
    }

    if (user.status !== "active") {
        throw new ApiError(403, "Account is not active");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    return { accessToken, refreshToken };
};

// ── forgotPassword ────────────────────────────────────────────────────────────
// 1. Finds user by email
// 2. Generates a random reset token
// 3. Stores a SHA-256 hash of the token in the DB (raw token never stored)
// 4. Returns the raw token to the caller (controller emails it to the user)
// Returns: { resetToken, user }
const forgotPassword = async (email) => {
    const user = await userModel.findOne({ email });

    // Same message whether the user exists or not — prevents email enumeration
    if (!user) {
        throw new ApiError(404, "If an account with this email exists, a reset link has been sent");
    }

    // Generate a cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash — the raw token is sent to the user's email.
    // If the DB is compromised, the raw tokens remain safe.
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    return { resetToken: rawToken, user };
};

// ── resetPassword ─────────────────────────────────────────────────────────────
// 1. Hashes the incoming token
// 2. Finds user by hashed token + checks expiry
// 3. Hashes the new password
// 4. Clears the reset token fields
const resetPassword = async ({ token, newPassword }) => {
    // Hash the incoming raw token to compare against the stored hash
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await userModel.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Reset token is invalid or has expired");
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    // Also invalidate any existing refresh token — force re-login after password change
    user.refreshToken = undefined;
    await user.save();
};

// ── getCurrentUser ────────────────────────────────────────────────────────────
// The auth middleware has already verified the token and attached req.user.
// This service function simply returns it — kept here for consistency.
const getCurrentUser = (user) => {
    return user;
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    getCurrentUser
};
