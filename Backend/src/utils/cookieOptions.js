// ─── Cookie Options ───────────────────────────────────────────────────────────
// Centralised cookie configuration so both auth controller and middleware
// use the same settings. Import these wherever you call res.cookie().
//
// accessTokenOptions  → short-lived, matches ACCESS_TOKEN_EXPIRY
// refreshTokenOptions → long-lived, matches REFRESH_TOKEN_EXPIRY

const isProd = process.env.NODE_ENV === "production";

// Access token cookie — kept short-lived (matches token expiry, e.g. 15m)
const accessTokenOptions = {
    httpOnly: true,   // not accessible via document.cookie — prevents XSS theft
    secure: isProd,   // HTTPS only in production; HTTP allowed in development
    sameSite: "strict" // blocks CSRF by not sending cookie on cross-site requests
};

// Refresh token cookie — longer-lived (matches token expiry, e.g. 7d or 30d)
const refreshTokenOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict"
};

module.exports = { accessTokenOptions, refreshTokenOptions };
