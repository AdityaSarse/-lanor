// ─── Cookie Options ───────────────────────────────────────────────────────────
// Centralised cookie configuration so both auth controller and middleware
// use the same settings. Import these wherever you call res.cookie().
//
// accessTokenOptions  → short-lived, matches ACCESS_TOKEN_EXPIRY
// refreshTokenOptions → long-lived, matches REFRESH_TOKEN_EXPIRY
//
// Required environment variables:
//   ACCESS_COOKIE_EXPIRES=15    (minutes)
//   REFRESH_COOKIE_EXPIRES=7   (days)
//
// Cross-origin note (production on separate domains):
//   Change sameSite to "none" and keep secure: true when frontend and backend
//   are deployed on different origins (e.g. shop.example.com + api.example.com).
//   "strict" is correct while both run on the same origin or locally.

const isProduction = process.env.NODE_ENV === "production";

// Access token cookie — lifetime matches the JWT (default: 15 minutes)
const accessTokenOptions = {
    httpOnly: true,    // not accessible via document.cookie — prevents XSS theft
    secure: isProduction, // HTTPS only in production; HTTP allowed in development
    sameSite: "strict", // blocks CSRF by not sending cookie on cross-site requests
    maxAge:
        Number(process.env.ACCESS_COOKIE_EXPIRES) *
        60 *
        1000 // minutes → milliseconds
};

// Refresh token cookie — lifetime matches the JWT (default: 7 days)
const refreshTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge:
        Number(process.env.REFRESH_COOKIE_EXPIRES) *
        24 *
        60 *
        60 *
        1000 // days → milliseconds
};

module.exports = { accessTokenOptions, refreshTokenOptions };
