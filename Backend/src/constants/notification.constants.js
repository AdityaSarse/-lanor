// ─────────────────────────────────────────────────────────────────────────────
// Notification Constants
//
// Single source of truth for notification types, channels, statuses, and
// default email subject lines.
// ─────────────────────────────────────────────────────────────────────────────

const NOTIFICATION_TYPES = {
    ORDER_PLACED:     "ORDER_PLACED",
    PAYMENT_SUCCESS:  "PAYMENT_SUCCESS",
    ORDER_SHIPPED:    "ORDER_SHIPPED",
    ORDER_DELIVERED:  "ORDER_DELIVERED",
    REFUND_PROCESSED: "REFUND_PROCESSED"
};

const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPES);

const NOTIFICATION_CHANNELS = {
    EMAIL:  "EMAIL",
    SMS:    "SMS",
    IN_APP: "IN_APP"
};

const NOTIFICATION_CHANNEL_VALUES = Object.values(NOTIFICATION_CHANNELS);

const NOTIFICATION_STATUS = {
    PENDING: "PENDING",
    SENT:    "SENT",
    FAILED:  "FAILED"
};

const EMAIL_SUBJECTS = {
    [NOTIFICATION_TYPES.ORDER_PLACED]:     "Order Confirmation - Thank you for your order!",
    [NOTIFICATION_TYPES.PAYMENT_SUCCESS]:  "Payment Received - Élanor Order",
    [NOTIFICATION_TYPES.ORDER_SHIPPED]:    "Your Élanor Order Has Been Shipped!",
    [NOTIFICATION_TYPES.ORDER_DELIVERED]:  "Your Order Has Been Delivered!",
    [NOTIFICATION_TYPES.REFUND_PROCESSED]: "Refund Confirmation - Élanor"
};

module.exports = {
    NOTIFICATION_TYPES,
    NOTIFICATION_TYPE_VALUES,
    NOTIFICATION_CHANNELS,
    NOTIFICATION_CHANNEL_VALUES,
    NOTIFICATION_STATUS,
    EMAIL_SUBJECTS
};
