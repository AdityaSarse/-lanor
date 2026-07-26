const { transporter, EMAIL_FROM } = require("../config/mail.config");
const {
    NOTIFICATION_TYPES,
    EMAIL_SUBJECTS
} = require("../constants/notification.constants");
const ApiError = require("../utils/ApiError");

// Import Templates
const generateOrderPlacedTemplate    = require("../templates/orderPlaced.template");
const generatePaymentSuccessTemplate = require("../templates/paymentSuccess.template");
const generateOrderShippedTemplate   = require("../templates/orderShipped.template");
const generateOrderDeliveredTemplate = require("../templates/orderDelivered.template");
const generateRefundTemplate         = require("../templates/refund.template");

// ─────────────────────────────────────────────────────────────────────────────
// Notification Service
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends an email using Nodemailer transporter.
 *
 * @param {Object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html    - HTML email content
 * @param {string} options.text    - Plain text email content
 * @returns {Promise<Object>} Nodemailer send info
 */
const sendEmail = async ({ to, subject, html, text }) => {
    if (!to) {
        throw new ApiError(400, "Recipient email address ('to') is required.");
    }

    try {
        const mailOptions = {
            from: EMAIL_FROM,
            to,
            subject,
            html,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error("[NotificationService] Email delivery error:", error);
        throw new ApiError(500, `Failed to send email: ${error.message}`);
    }
};

/**
 * Sends Order Placed confirmation email.
 *
 * @param {Object} user  - User details (name, email)
 * @param {Object} order - Populated Order document
 */
const sendOrderPlacedNotification = async (user, order) => {
    const recipientEmail = user?.email || order?.shippingAddress?.email;
    const { html, text } = generateOrderPlacedTemplate({ user, order });
    const subject = EMAIL_SUBJECTS[NOTIFICATION_TYPES.ORDER_PLACED];

    return await sendEmail({
        to: recipientEmail,
        subject,
        html,
        text
    });
};

/**
 * Sends Payment Success receipt email.
 *
 * @param {Object} user    - User details (name, email)
 * @param {Object} order   - Order details
 * @param {Object} payment - Payment transaction details
 */
const sendPaymentSuccessNotification = async (user, order, payment) => {
    const recipientEmail = user?.email || order?.shippingAddress?.email;
    const { html, text } = generatePaymentSuccessTemplate({ user, order, payment });
    const subject = EMAIL_SUBJECTS[NOTIFICATION_TYPES.PAYMENT_SUCCESS];

    return await sendEmail({
        to: recipientEmail,
        subject,
        html,
        text
    });
};

/**
 * Sends Order Shipped notification email.
 *
 * @param {Object} user         - User details (name, email)
 * @param {Object} order        - Order details
 * @param {Object} trackingData - Tracking info (carrier, trackingNumber, trackingUrl, estimatedDelivery)
 */
const sendOrderShippedNotification = async (user, order, trackingData = {}) => {
    const recipientEmail = user?.email || order?.shippingAddress?.email;
    const { html, text } = generateOrderShippedTemplate({
        user,
        order,
        ...trackingData
    });
    const subject = EMAIL_SUBJECTS[NOTIFICATION_TYPES.ORDER_SHIPPED];

    return await sendEmail({
        to: recipientEmail,
        subject,
        html,
        text
    });
};

/**
 * Sends Order Delivered notification email.
 *
 * @param {Object} user  - User details (name, email)
 * @param {Object} order - Order details
 */
const sendOrderDeliveredNotification = async (user, order) => {
    const recipientEmail = user?.email || order?.shippingAddress?.email;
    const { html, text } = generateOrderDeliveredTemplate({ user, order });
    const subject = EMAIL_SUBJECTS[NOTIFICATION_TYPES.ORDER_DELIVERED];

    return await sendEmail({
        to: recipientEmail,
        subject,
        html,
        text
    });
};

/**
 * Sends Refund Processed notification email.
 *
 * @param {Object} user       - User details (name, email)
 * @param {Object} order      - Order details
 * @param {Object} refundData - Refund details (refundId, amount, reason)
 */
const sendRefundNotification = async (user, order, refundData = {}) => {
    const recipientEmail = user?.email || order?.shippingAddress?.email;
    const { html, text } = generateRefundTemplate({ user, order, refund: refundData });
    const subject = EMAIL_SUBJECTS[NOTIFICATION_TYPES.REFUND_PROCESSED];

    return await sendEmail({
        to: recipientEmail,
        subject,
        html,
        text
    });
};

/**
 * Unified notification dispatcher method for dynamic notification dispatching.
 *
 * @param {Object} params
 * @param {string} params.to      - Recipient email address
 * @param {string} params.type    - Notification type enum value
 * @param {Object} params.payload - Data payload (user, order, payment, refund, etc.)
 */
const sendNotification = async ({ to, type, payload = {} }) => {
    const { user = {}, order = {}, payment = {}, refund = {}, tracking = {} } = payload;
    const targetEmail = to || user?.email;

    switch (type) {
        case NOTIFICATION_TYPES.ORDER_PLACED:
            return await sendOrderPlacedNotification({ ...user, email: targetEmail }, order);

        case NOTIFICATION_TYPES.PAYMENT_SUCCESS:
            return await sendPaymentSuccessNotification({ ...user, email: targetEmail }, order, payment);

        case NOTIFICATION_TYPES.ORDER_SHIPPED:
            return await sendOrderShippedNotification({ ...user, email: targetEmail }, order, tracking);

        case NOTIFICATION_TYPES.ORDER_DELIVERED:
            return await sendOrderDeliveredNotification({ ...user, email: targetEmail }, order);

        case NOTIFICATION_TYPES.REFUND_PROCESSED:
            return await sendRefundNotification({ ...user, email: targetEmail }, order, refund);

        default:
            throw new ApiError(400, `Unsupported notification type: ${type}`);
    }
};

/**
 * Non-blocking / fire-and-forget notification dispatch.
 * Dispatches notification asynchronously in background without blocking API execution.
 *
 * @param {Object} options - Notification options (to, type, payload)
 */
const sendNotificationAsync = (options) => {
    sendNotification(options).catch((error) => {
        console.error("[NotificationService] Async background delivery failed:", error?.message || error);
    });
};

module.exports = {
    sendEmail,
    sendOrderPlacedNotification,
    sendPaymentSuccessNotification,
    sendOrderShippedNotification,
    sendOrderDeliveredNotification,
    sendRefundNotification,
    sendNotification,
    sendNotificationAsync
};
