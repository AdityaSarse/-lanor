const crypto   = require("crypto");
const mongoose = require("mongoose");
const razorpay = require("../config/razorpay");
const Order               = require("../models/order.model");
const Product             = require("../models/products.model");
const notificationService = require("./notification.service");
const ApiError            = require("../utils/ApiError");
const {
    PAYMENT_STATUS,
    RAZORPAY_WEBHOOK_EVENTS
} = require("../constants/payment.constants");

// ─────────────────────────────────────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches an order by ID or throws 404.
 *
 * @param {string} orderId - Order ObjectId string.
 * @returns {Promise<Order>} Mongoose Order document.
 * @throws {ApiError} 404
 */
const getOrderOrThrow = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    return order;
};

/**
 * Validates whether an order is eligible for online payment processing.
 *
 * @param {Order}  order  - Order document.
 * @param {string} userId - Authenticated customer ObjectId string.
 * @throws {ApiError} 403 | 400
 */
const validatePaymentEligibility = (order, userId) => {
    // 1. Verify Ownership
    if (order.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You do not have permission to process payment for this order");
    }

    // 2. Reject COD orders from online payment processing
    if (order.payment.method === "COD") {
        throw new ApiError(400, "Cash on Delivery orders do not require online payment processing");
    }

    // 3. Reject already paid or refunded orders
    if (order.payment.status === PAYMENT_STATUS.PAID) {
        throw new ApiError(400, "This order has already been paid for");
    }

    if (order.payment.status === PAYMENT_STATUS.REFUNDED) {
        throw new ApiError(400, "This order has been refunded and cannot be paid for");
    }

    // 4. Reject cancelled or returned orders
    if (["Cancelled", "Returned"].includes(order.orderStatus)) {
        throw new ApiError(400, `Cannot process payment for an order in "${order.orderStatus}" status`);
    }
};

/**
 * Calls Razorpay API to create a gateway order.
 * Amount is derived securely from order.pricing.total (never from client request).
 *
 * @param {Order} order - Order document.
 * @returns {Promise<Object>} Razorpay order response object.
 * @throws {ApiError} 500
 */
const createGatewayOrder = async (order) => {
    try {
        // Convert total ₹ to paise (1 INR = 100 paise)
        const amountInPaise = Math.round(order.pricing.total * 100);

        const options = {
            amount:   amountInPaise,
            currency: "INR",
            receipt:  order.orderNumber,
            notes: {
                orderId:     order._id.toString(),
                orderNumber: order.orderNumber
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);
        return razorpayOrder;
    } catch (error) {
        throw new ApiError(
            500,
            `Failed to create Razorpay payment order: ${error.message || "Gateway error"}`
        );
    }
};

/**
 * Verifies the HMAC SHA256 signature returned by Razorpay Checkout widget.
 * Formula: HMAC_SHA256(razorpayOrderId + "|" + razorpayPaymentId, key_secret)
 *
 * @param {Object} data - { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * @returns {boolean} True if signature matches.
 */
const verifyGatewaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return false;

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    try {
        return crypto.timingSafeEqual(
            Buffer.from(generatedSignature, "utf-8"),
            Buffer.from(razorpaySignature, "utf-8")
        );
    } catch (err) {
        return false;
    }
};

/**
 * Verifies Razorpay Webhook signature using RAZORPAY_WEBHOOK_SECRET.
 *
 * @param {string} signature - x-razorpay-signature header.
 * @param {string|Buffer} rawBody - Raw body payload.
 * @returns {boolean} True if signature is valid.
 */
const verifyWebhookSignature = (signature, rawBody) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || !signature) return false;

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    try {
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, "utf-8"),
            Buffer.from(signature, "utf-8")
        );
    } catch (err) {
        return false;
    }
};

/**
 * Restores variant stock in Product collection using bulkWrite for efficiency.
 *
 * @param {Array} orderItems - Order line items.
 * @param {Object} [session] - Optional Mongoose ClientSession.
 */
const restoreStock = async (orderItems, session = null) => {
    if (!orderItems || orderItems.length === 0) return;

    const bulkOps = orderItems.map((item) => ({
        updateOne: {
            filter: {
                _id: item.product,
                "variants.color.name": new RegExp(`^${item.color.name}$`, "i")
            },
            update: {
                $inc: { "variants.$[v].sizes.$[s].stock": item.quantity }
            },
            arrayFilters: [
                { "v.color.name": new RegExp(`^${item.color.name}$`, "i") },
                { "s.size": item.size }
            ]
        }
    }));

    const options = session ? { session } : {};
    await Product.bulkWrite(bulkOps, options);
};

// ─────────────────────────────────────────────────────────────────────────────
// Payment Service
// ─────────────────────────────────────────────────────────────────────────────

// ─── createPayment ────────────────────────────────────────────────────────────
/**
 * Initiates online payment for an existing unpaid order.
 * Creates a Razorpay Order and attaches gatewayOrderId to the order document.
 *
 * @param {string} orderId - Order ObjectId.
 * @param {string} userId  - Authenticated customer ObjectId.
 * @returns {Promise<{ key, amount, currency, razorpayOrderId, orderNumber }>}
 * @throws {ApiError} 404 | 403 | 400 | 500
 */
const createPayment = async (orderId, userId) => {
    // 1. Fetch Order
    const order = await getOrderOrThrow(orderId);

    // 2. Validate Eligibility & Ownership
    validatePaymentEligibility(order, userId);

    // 3. Create Razorpay Gateway Order
    const razorpayOrder = await createGatewayOrder(order);

    // 4. Update Order payment metadata
    order.payment.gateway = "Razorpay";
    order.payment.gatewayOrderId = razorpayOrder.id;
    order.payment.status = PAYMENT_STATUS.CREATED;
    await order.save();

    return {
        key:             process.env.RAZORPAY_KEY_ID || "",
        amount:          razorpayOrder.amount,
        currency:        razorpayOrder.currency,
        razorpayOrderId: razorpayOrder.id,
        orderNumber:     order.orderNumber
    };
};

// ─── verifyPayment ────────────────────────────────────────────────────────────
/**
 * Verifies Razorpay checkout HMAC signature and marks the order as Paid / Confirmed.
 * Executes payment and order state transition inside an ACID transaction.
 *
 * @param {Object} paymentData - { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * @param {string} userId      - Authenticated customer ObjectId.
 * @returns {Promise<Order>} Updated order document.
 * @throws {ApiError} 404 | 403 | 400
 */
const verifyPayment = async (paymentData, userId) => {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

    // 1. Fetch & Validate Eligibility
    const order = await getOrderOrThrow(orderId);
    validatePaymentEligibility(order, userId);

    // 2. Verify HMAC Signature
    const isValidSignature = verifyGatewaySignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    });

    if (!isValidSignature) {
        order.payment.status = PAYMENT_STATUS.FAILED;
        await order.save();
        throw new ApiError(400, "Invalid payment signature. Verification failed.");
    }

    // 3. Atomically Update Order & Payment Status
    const session = await mongoose.startSession().catch(() => null);

    try {
        if (session) session.startTransaction();
        const opts = session ? { session } : {};

        order.payment.gatewayPaymentId = razorpayPaymentId;
        order.payment.gatewaySignature = razorpaySignature;
        order.payment.transactionId    = razorpayPaymentId;
        order.payment.status           = PAYMENT_STATUS.PAID;

        if (order.orderStatus === "Pending") {
            order.orderStatus = "Confirmed";
            order.statusHistory.push({
                status:    "Confirmed",
                changedAt: new Date(),
                changedBy: "system:razorpay"
            });
        }

        await order.save(opts);

        if (session) await session.commitTransaction();
    } catch (error) {
        if (session) await session.abortTransaction();
        throw error;
    }

    // Trigger non-blocking Payment Success notification
    if (order) {
        Order.findById(order._id)
            .populate({ path: "user", select: "fullName name email" })
            .lean()
            .then((populatedOrder) => {
                if (populatedOrder) {
                    notificationService
                        .sendPaymentSuccessNotification(
                            populatedOrder.user || { email: populatedOrder.shippingAddress?.email },
                            populatedOrder,
                            {
                                razorpayPaymentId: razorpayPaymentId,
                                amount: populatedOrder.pricing?.total || 0,
                                gateway: "Razorpay"
                            }
                        )
                        .catch((err) => console.error("[PaymentService] Failed to send payment receipt email:", err?.message || err));
                }
            })
            .catch((err) => console.error("[PaymentService] Payment notification user lookup error:", err?.message || err));
    }

    return order;
};

// ─── refundPayment ────────────────────────────────────────────────────────────
/**
 * Admin method to process a refund via Razorpay API.
 * Restores product inventory using bulkWrite and sets orderStatus & payment.status to Refunded.
 *
 * @param {string} orderId     - Order ObjectId.
 * @param {string} adminUserId - Admin user ObjectId string.
 * @param {string} [reason]    - Optional refund reason.
 * @returns {Promise<Order>} Updated order document.
 * @throws {ApiError} 404 | 400 | 500
 */
const refundPayment = async (orderId, adminUserId, reason = "") => {
    const order = await getOrderOrThrow(orderId);

    if (order.payment.status !== PAYMENT_STATUS.PAID) {
        throw new ApiError(400, `Only paid orders can be refunded. Current payment status is "${order.payment.status}"`);
    }

    if (!order.payment.gatewayPaymentId) {
        throw new ApiError(400, "Cannot refund order: Missing gateway payment ID");
    }

    // Call Razorpay Refund API
    try {
        const amountInPaise = Math.round(order.pricing.total * 100);
        await razorpay.payments.refund(order.payment.gatewayPaymentId, {
            amount: amountInPaise,
            notes: {
                reason:      reason || "Admin initiated refund",
                orderId:     order._id.toString(),
                orderNumber: order.orderNumber
            }
        });
    } catch (error) {
        throw new ApiError(
            500,
            `Razorpay refund processing failed: ${error.message || "Gateway error"}`
        );
    }

    // Execute state updates inside transaction
    const session = await mongoose.startSession().catch(() => null);

    try {
        if (session) session.startTransaction();

        order.payment.status = PAYMENT_STATUS.REFUNDED;
        order.orderStatus    = "Refunded";
        order.statusHistory.push({
            status:    "Refunded",
            changedAt: new Date(),
            changedBy: `admin:${adminUserId}`
        });

        if (reason) {
            order.adminNote = order.adminNote
                ? `${order.adminNote} | Refund reason: ${reason}`
                : `Refund reason: ${reason}`;
        }

        // Restore product stock upon refund using bulkWrite
        await restoreStock(order.items, session);
        await order.save(session ? { session } : {});

        if (session) await session.commitTransaction();
    } catch (error) {
        if (session) await session.abortTransaction();
        throw error;
    }

    // Trigger non-blocking Refund Processed notification
    if (order) {
        Order.findById(order._id)
            .populate({ path: "user", select: "fullName name email" })
            .lean()
            .then((populatedOrder) => {
                if (populatedOrder) {
                    notificationService
                        .sendRefundNotification(
                            populatedOrder.user || { email: populatedOrder.shippingAddress?.email },
                            populatedOrder,
                            {
                                refundId: populatedOrder.payment?.gatewayPaymentId || "N/A",
                                amount: populatedOrder.pricing?.total || 0,
                                reason: reason || "Admin Refund"
                            }
                        )
                        .catch((err) => console.error("[PaymentService] Failed to send refund notification email:", err?.message || err));
                }
            })
            .catch((err) => console.error("[PaymentService] Refund notification user lookup error:", err?.message || err));
    }

    return order;
};

// ─── handleWebhook ────────────────────────────────────────────────────────────
/**
 * Asynchronous webhook handler for Razorpay server-to-server notifications.
 * Ensures orders update even if client disconnects after checkout payment.
 *
 * @param {string} signature - x-razorpay-signature header.
 * @param {string|Buffer} rawBody - Raw HTTP body payload.
 * @returns {Promise<{ received: boolean }>}
 * @throws {ApiError} 400
 */
const handleWebhook = async (signature, rawBody) => {
    // 1. Verify Webhook Signature
    const isValid = verifyWebhookSignature(signature, rawBody);
    if (!isValid) {
        throw new ApiError(400, "Invalid webhook signature");
    }

    let payload;
    try {
        payload = JSON.parse(rawBody.toString());
    } catch (err) {
        throw new ApiError(400, "Invalid JSON webhook payload");
    }

    const event = payload.event;

    // Ignore unsupported webhook events gracefully
    if (!RAZORPAY_WEBHOOK_EVENTS.includes(event)) {
        return { received: true };
    }

    // 2. Handle Payment Captured / Authorized Event
    if (event === "payment.captured" || event === "payment.authorized") {
        const paymentEntity = payload.payload?.payment?.entity;
        const razorpayOrderId   = paymentEntity?.order_id;
        const razorpayPaymentId = paymentEntity?.id;

        if (razorpayOrderId) {
            const order = await Order.findOne({ "payment.gatewayOrderId": razorpayOrderId });
            if (order && order.payment.status !== PAYMENT_STATUS.PAID) {
                order.payment.status           = PAYMENT_STATUS.PAID;
                order.payment.gatewayPaymentId = razorpayPaymentId || order.payment.gatewayPaymentId;
                order.payment.transactionId    = razorpayPaymentId || order.payment.transactionId;

                if (order.orderStatus === "Pending") {
                    order.orderStatus = "Confirmed";
                    order.statusHistory.push({
                        status:    "Confirmed",
                        changedAt: new Date(),
                        changedBy: "webhook:razorpay"
                    });
                }
                await order.save();

                // Trigger non-blocking Payment Success notification for webhook payments
                Order.findById(order._id)
                    .populate({ path: "user", select: "fullName name email" })
                    .lean()
                    .then((populatedOrder) => {
                        if (populatedOrder) {
                            notificationService
                                .sendPaymentSuccessNotification(
                                    populatedOrder.user || { email: populatedOrder.shippingAddress?.email },
                                    populatedOrder,
                                    {
                                        razorpayPaymentId: razorpayPaymentId,
                                        amount: populatedOrder.pricing?.total || 0,
                                        gateway: "Razorpay (Webhook)"
                                    }
                                )
                                .catch((err) => console.error("[PaymentService Webhook] Failed to send payment receipt email:", err?.message || err));
                        }
                    })
                    .catch((err) => console.error("[PaymentService Webhook] Payment notification user lookup error:", err?.message || err));
            }
        }
    }

    // 3. Handle Payment Failed Event
    if (event === "payment.failed") {
        const paymentEntity = payload.payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;

        if (razorpayOrderId) {
            const order = await Order.findOne({ "payment.gatewayOrderId": razorpayOrderId });
            if (order && order.payment.status !== PAYMENT_STATUS.PAID) {
                order.payment.status = PAYMENT_STATUS.FAILED;
                await order.save();
            }
        }
    }

    return { received: true };
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createPayment,
    verifyPayment,
    refundPayment,
    handleWebhook
};
