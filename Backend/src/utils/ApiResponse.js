// ─── ApiResponse ──────────────────────────────────────────────────────────────
// Standardised success response wrapper.
// Use this in every controller instead of calling res.json() directly.
//
// Usage:
//   return res
//       .status(200)
//       .json(new ApiResponse(200, user, "User fetched successfully"));
//
// Output:
//   {
//       "success": true,
//       "statusCode": 200,
//       "message": "User fetched successfully",
//       "data": { ... }
//   }
//
// Consistent shape across the entire API — mirrors ApiError so the frontend
// always receives the same four fields regardless of success or failure:
//
//   ✅ Success → { success: true,  statusCode, message, data: <payload> }
//   ❌ Error   → { success: false, statusCode, message, data: null, errors: [] }

class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.success = statusCode < 400; // true for 2xx/3xx, false for 4xx/5xx
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

module.exports = ApiResponse;
