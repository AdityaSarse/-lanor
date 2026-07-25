const express = require("express");
const router  = express.Router();

const paymentController = require("../controllers/payment.controller");

const validate                  = require("../middelwares/validation.middleware");
const { verifyJWT, verifyRole } = require("../middelwares/auth.middleware");

const {
    createPaymentValidator,
    verifyPaymentValidator,
    refundPaymentValidator
} = require("../validators/payment.validator");

// ─────────────────────────────────────────────────────────────────────────────
// Payment Routes
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: Webhook route MUST receive unparsed raw body bytes (express.raw) for
// accurate Razorpay HMAC SHA256 signature verification.
// POST /api/v1/payments/webhook
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    paymentController.handleWebhook
);

// ─── Protected Customer Routes ────────────────────────────────────────────────

// POST /api/v1/payments/create — Initiates payment order on Razorpay
router.post(
    "/create",
    verifyJWT,
    createPaymentValidator,
    validate,
    paymentController.createPayment
);

// POST /api/v1/payments/verify — Verifies Razorpay checkout HMAC signature
router.post(
    "/verify",
    verifyJWT,
    verifyPaymentValidator,
    validate,
    paymentController.verifyPayment
);

// ─── Protected Admin Routes ───────────────────────────────────────────────────

// POST /api/v1/payments/:orderId/refund — Admin initiated refund
router.post(
    "/:orderId/refund",
    verifyJWT,
    verifyRole("admin"),
    refundPaymentValidator,
    validate,
    paymentController.refundPayment
);

module.exports = router;
