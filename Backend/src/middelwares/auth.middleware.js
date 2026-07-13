const JWT = require("jsonwebtoken");
const userModel = require("../models/users.models");

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized request: No token provided"
            });
        }

        const decodedToken = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET);
        
        const user = await userModel.findById(decodedToken.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid Access Token: User not found"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid Access Token",
            error: error.message
        });
    }
};

module.exports = { verifyJWT };
