// ─── ApiError ─────────────────────────────────────────────────────────────────
// Custom error class that extends the native Error.
// Thrown from controllers and services — caught by error.middleware.js which
// converts it into a structured JSON response automatically.
//
// Usage:
//   throw new ApiError(404, "User not found");
//   throw new ApiError(422, "Validation failed", validationErrors);
//
// Instead of writing res.status(...).json(...) in every controller:
//
//   ❌  return res.status(404).json({ success: false, message: "User not found" });
//   ✅  throw new ApiError(404, "User not found");

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        // Pass message to the native Error so .message and .stack work correctly
        super(message);

        this.name = this.constructor.name; // "ApiError" — easier to identify in logs than generic "Error"
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;  // always false — errors are never successful
        this.errors = errors;  // optional array for field-level validation errors
        this.data = null;      // mirrors ApiResponse shape — frontend always gets data field

        if (stack) {
            // Use a provided stack (useful when re-throwing a caught error)
            this.stack = stack;
        } else {
            // Capture a clean stack trace that starts at the throw site,
            // not inside this constructor
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;
