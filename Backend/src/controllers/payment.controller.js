const asyncHandler   = require("../utils/asyncHandler");
const ApiResponse    = require("../utils/ApiResponse");
const paymentService = require("../services/payment.service");

// ─────────────────────────────────────────────────────────────────────────────
// Payment Controller
// ─────────────────────────────────────────────────────────────────────────────

// ─── Create Payment (Customer) ────────────────────────────────────────────────
// POST /api/v1/payments/create
const createPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const paymentData = await paymentService.createPayment(
        orderId,
        req.user._id
    );

    return res
        .status(201)
        .json(new ApiResponse(201, paymentData, "Payment initiated successfully"));
});

// ─── Verify Payment (Customer) ────────────────────────────────────────────────
// POST /api/v1/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
    const order = await paymentService.verifyPayment(
        req.body,
        req.user._id
    );

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Payment verified successfully"));
});

// ─── Refund Payment (Admin) ───────────────────────────────────────────────────
// POST /api/v1/payments/:orderId/refund
const refundPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { reason }  = req.body;

    const order = await paymentService.refundPayment(
        orderId,
        req.user._id.toString(),
        reason
    );

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Payment refunded successfully"));
});

// ─── Handle Webhook (Razorpay Server-to-Server) ──────────────────────────────
// POST /api/v1/payments/webhook
const handleWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];

    // Support both express.raw() buffer or JSON string
    const rawBody = req.rawBody || (typeof req.body === "string" ? req.body : JSON.stringify(req.body));

    const result = await paymentService.handleWebhook(signature, rawBody);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Webhook processed successfully"));
});

module.exports = {
    createPayment,
    verifyPayment,
    refundPayment,
    handleWebhook
};
