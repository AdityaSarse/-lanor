const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// ─── Validation Middleware ────────────────────────────────────────────────────
// Run AFTER express-validator rule arrays, BEFORE the controller.
//
// Request lifecycle with validation:
//   Request → validator rules → validate → controller
//
// If any rule fails, the controller is never called.
// All field errors are collected and returned at once (not just the first one).
//
// Usage in routes:
//   router.post("/register", registerValidator, validate, registerUser);
//
// Error response shape:
//   {
//       "success": false,
//       "statusCode": 400,
//       "message": "Validation failed",
//       "errors": [
//           { "field": "email",    "message": "Invalid email address" },
//           { "field": "password", "message": "Password must be at least 8 characters" }
//       ],
//       "data": null
//   }

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Collect all field errors — not just the first — so the frontend can
        // highlight every invalid field in one round trip
        throw new ApiError(
            400,
            "Validation failed",
            errors.array().map((error) => ({
                field: error.path,
                message: error.msg
            }))
        );
    }

    next();
};

module.exports = validate;
