const ApiError = require("../utils/ApiError");

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be registered LAST in app.js — after all routes.
// Express identifies it as an error handler by the 4-argument signature (err, req, res, next).
//
// Catches:
//   ✅ ApiError (thrown from controllers/services)
//   ✅ Mongoose ValidationError
//   ✅ MongoDB duplicate key (E11000)
//   ✅ Invalid MongoDB ObjectId (CastError)
//   ✅ JWT errors (JsonWebTokenError, TokenExpiredError)
//   ✅ Any unexpected runtime error (fallback 500)

const errorHandler = (err, req, res, next) => {
    // Start with the original error; remap below if it's a known type
    let error = err;

    // ── Normalize non-ApiError instances ─────────────────────────────────────
    // Ensures error always has statusCode, success, errors, data shape
    if (!(error instanceof ApiError)) {
        error = new ApiError(
            error.statusCode || 500,
            error.message || "Internal Server Error"
        );
    }

    // ── Mongoose Validation Error ─────────────────────────────────────────────
    // Triggered by schema validators (required, minlength, enum, custom, etc.)
    if (err.name === "ValidationError") {
        error = new ApiError(
            400,
            "Validation Error",
            Object.values(err.errors).map((e) => ({
                field: e.path,
                message: e.message
            }))
        );
    }

    // ── MongoDB Duplicate Key (E11000) ────────────────────────────────────────
    // Triggered by unique index violations (e.g. email already registered)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = new ApiError(409, `${field} already exists`);
    }

    // ── Invalid MongoDB ObjectId ──────────────────────────────────────────────
    // Triggered when a route param like :id is not a valid ObjectId
    if (err.name === "CastError") {
        error = new ApiError(400, `Invalid ${err.path}`);
    }

    // ── JWT Errors ────────────────────────────────────────────────────────────
    if (err.name === "JsonWebTokenError") {
        error = new ApiError(401, "Invalid token");
    }

    if (err.name === "TokenExpiredError") {
        error = new ApiError(401, "Token expired");
    }

    // ── Internal logging ──────────────────────────────────────────────────────
    // Log full error details in development — method + URL helps pinpoint which
    // endpoint triggered the error without needing a separate request logger.
    // In production, replace console.error with Pino or Winston.
    if (process.env.NODE_ENV !== "production") {
        console.error({
            method: req.method,
            url: req.originalUrl,
            name: err.name,
            message: err.message,
            stack: err.stack
        });
    }

    // ── Send response ─────────────────────────────────────────────────────────
    return res.status(error.statusCode).json({
        success: error.success,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        data: error.data,
        // Include stack trace in development — never expose in production
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
};

module.exports = errorHandler;
