let razorpay;

try {
    const Razorpay = require("razorpay");
    const sanitize = (val) => (val ? val.trim().replace(/^["']|["']$/g, '') : "");
    razorpay = new Razorpay({
        key_id:     sanitize(process.env.RAZORPAY_KEY_ID)     || "rzp_test_placeholder",
        key_secret: sanitize(process.env.RAZORPAY_KEY_SECRET) || "placeholder_secret"
    });
} catch (error) {
    console.warn("[Razorpay Config] Warning: 'razorpay' package is not installed or failed to load. Please run 'npm install razorpay'.");
    razorpay = {
        orders: { create: async () => { throw new Error("Razorpay package is not installed. Please run 'npm install'."); } },
        payments: { fetch: async () => { throw new Error("Razorpay package is not installed. Please run 'npm install'."); } },
        refunds: { create: async () => { throw new Error("Razorpay package is not installed. Please run 'npm install'."); } }
    };
}

module.exports = razorpay;
