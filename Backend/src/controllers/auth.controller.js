const { JsonWebTokenError } = require("jsonwebtoken");
const userModel = require("../models/users.models")
const JWT = require("jsonwebtoken")
const bcrypt = require("bcrypt")


async function registerUser(req, res) {
    const { firstName, lastName, email, password, phone, role = "customer" } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            message: "First name, last name, email, and password are required"
        });
    }

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

    const token = JWT.sign({
        id: user._id,
        role: user.role
    }, process.env.JWT_SECRET);

    res.cookie("token", token, {
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
        }
    });
}


async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

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
    await user.save();

    const token = JWT.sign({
        id: user._id,
        role: user.role
    }, process.env.JWT_SECRET);

    res.cookie("token", token, {
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
        }
    });
}

async function logoutUser(req, res) {
    try {
        res.clearCookie("token", {
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
module.exports = {
    registerUser,
    loginUser,
    logoutUser
}