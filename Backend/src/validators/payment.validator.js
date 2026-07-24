const { body, param } = require("express-validator");

// ─────────────────────────────────────────────────────────────────────────────
// Payment Validators
// ─────────────────────────────────────────────────────────────────────────────

// ─── Create Payment (Customer) ────────────────────────────────────────────────
// Triggers creation of a Razorpay order for an existing unpaid e-commerce order.
const createPaymentValidator = [
    body("orderId")
        .notEmpty()
        .withMessage("Order ID is required")
        .bail()
        .isMongoId()
        .withMessage("Invalid order ID")
];

// ─── Verify Payment (Customer / Checkout callback) ───────────────────────────
// Receives orderId + HMAC payload returned by Razorpay Checkout widget.
const verifyPaymentValidator = [
    body("orderId")
        .notEmpty()
        .withMessage("Order ID is required")
        .bail()
        .isMongoId()
        .withMessage("Invalid order ID"),

    body("razorpayOrderId")
        .trim()
        .notEmpty()
        .withMessage("Razorpay order ID is required")
        .bail(),

    body("razorpayPaymentId")
        .trim()
        .notEmpty()
        .withMessage("Razorpay payment ID is required")
        .bail(),

    body("razorpaySignature")
        .trim()
        .notEmpty()
        .withMessage("Razorpay signature is required")
        .bail()
];

// ─── Refund Payment (Admin) ──────────────────────────────────────────────────
// Route: POST /api/v1/payments/:orderId/refund
const refundPaymentValidator = [
    param("orderId")
        .isMongoId()
        .withMessage("Invalid order ID"),

    body("reason")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Refund reason cannot exceed 500 characters")
];

module.exports = {
    createPaymentValidator,
    verifyPaymentValidator,
    refundPaymentValidator
};
