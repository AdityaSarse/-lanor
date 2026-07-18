// ─── asyncHandler ─────────────────────────────────────────────────────────────
// Wraps any async route handler or middleware so you never need try/catch
// blocks in controllers. Uncaught errors are forwarded to Express's global
// error handler via next(error).
//
// Usage:
//   router.get("/me", asyncHandler(getMe));
//   const verifyJWT = asyncHandler(async (req, res, next) => { ... });

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
