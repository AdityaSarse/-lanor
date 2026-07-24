const Razorpay = require("razorpay");

// ─────────────────────────────────────────────────────────────────────────────
// Razorpay Instance Configuration
//
// Single source of truth for Razorpay SDK initialization.
// Key credentials are loaded from environment variables (.env).
// The rest of the application imports this pre-configured instance.
// ─────────────────────────────────────────────────────────────────────────────

const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID     || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret"
});

module.exports = razorpay;
