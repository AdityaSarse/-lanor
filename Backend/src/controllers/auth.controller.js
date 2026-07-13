const { JsonWebTokenError } = require("jsonwebtoken");
const userModel = require("../models/users.models");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Helper function to generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await userModel.findById(userId);
        
        const accessToken = JWT.sign(
            { id: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "access_secret",
            { expiresIn: "1d" }
        );
        
        const refreshToken = JWT.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + "_refresh" : "refresh_secret"),
            { expiresIn: "10d" }
        );

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error("Could not generate tokens: " + error.message);
    }
};

async function registerUser(req, res) {
    const { firstName, lastName, email, password, phone, role = "customer" } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            message: "First name, last name, email, and password are required"
        });
    }

    try {
        const isUserAlreadyExists = await userModel.findOne({ email });

        if (isUserAlreadyExists) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            firstName,
            lastName,
            email,
            phone,
            password: hash,
            role
        });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong during registration",
            error: error.message
        });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        // Update lastLogin timestamp
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong during login",
            error: error.message
        });
    }
}

async function logoutUser(req, res) {
    try {
        if (req.user) {
            await userModel.findByIdAndUpdate(req.user._id, {
                $unset: { refreshToken: 1 }
            });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong during logout",
            error: error.message
        });
    }
}

async function getMe(req, res) {
    return res.status(200).json({
        message: "User fetched successfully",
        user: req.user
    });
}

async function refreshAccessToken(req, res) {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(401).json({
            message: "Unauthorized: Refresh token is missing"
        });
    }

    try {
        const decodedToken = JWT.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + "_refresh" : "refresh_secret")
        );

        const user = await userModel.findById(decodedToken.id);

        if (!user) {
            return res.status(401).json({
                message: "Invalid refresh token: User not found"
            });
        }

        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(401).json({
                message: "Refresh token is expired or used"
            });
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        return res.status(401).json({
            message: "Invalid refresh token",
            error: error.message
        });
    }
}

async function forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User with this email does not exist"
            });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        user.forgotPasswordToken = resetToken;
        user.forgotPasswordExpiry = Date.now() + 3600000; // 1 hour expiry
        await user.save({ validateBeforeSave: false });

        const resetUrl = `http://localhost:${process.env.PORT || 3000}/api/auth/reset-password?token=${resetToken}`;
        console.log("================ PASSWORD RESET URL ================");
        console.log(resetUrl);
        console.log("====================================================");

        return res.status(200).json({
            message: "Password reset token generated. Check console logs for link in development.",
            resetToken,
            resetUrl
        });
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong during forgot password",
            error: error.message
        });
    }
}

async function resetPassword(req, res) {
    const token = req.query.token || req.body.token;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            message: "Token and new password are required"
        });
    }

    try {
        const user = await userModel.findOne({
            forgotPasswordToken: token,
            forgotPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        user.password = hash;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password reset successful"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong during password reset",
            error: error.message
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    refreshAccessToken,
    forgotPassword,
    resetPassword
};