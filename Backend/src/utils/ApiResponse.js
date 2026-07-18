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
//       "data": { ... },
//       "meta": null              ← null when not paginated
//   }
//
// With pagination:
//   new ApiResponse(200, products, "Products fetched", { page, limit, total })
//   → { ..., "meta": { "page": 1, "limit": 10, "total": 257 } }
//
// Consistent shape across the entire API — mirrors ApiError so the frontend
// always receives the same four fields regardless of success or failure:
//
//   ✅ Success → { success: true,  statusCode, message, data: <payload> }
//   ❌ Error   → { success: false, statusCode, message, data: null, errors: [] }

class ApiResponse {
    constructor(
        statusCode,
        data,
        message = "Success",
        meta = null // optional pagination/extra metadata
    ) {
        this.success = statusCode < 400; // true for 2xx/3xx, false for 4xx/5xx
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.meta = meta;
    }
}

module.exports = ApiResponse;
