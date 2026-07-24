// ─────────────────────────────────────────────────────────────────────────────
// Payment Constants
//
// Single source of truth for payment-related enums shared across:
//   - models     (enum arrays)
//   - validators (isIn checks)
//   - services   (Razorpay/Stripe event guards & payment flow handlers)
// ─────────────────────────────────────────────────────────────────────────────

const PAYMENT_GATEWAYS = [
    "Cash",
    "Razorpay",
    "Stripe"
];

const PAYMENT_METHODS = [
    "COD",
    "Card",
    "UPI",
    "Net Banking",
    "Wallet"
];

const PAYMENT_STATUS = {
    PENDING:    "Pending",
    CREATED:    "Created",
    AUTHORIZED: "Authorized",
    PAID:       "Paid",
    FAILED:     "Failed",
    CANCELLED:  "Cancelled",
    REFUNDED:   "Refunded"
};

const PAYMENT_STATUSES = Object.values(PAYMENT_STATUS);

const REFUND_STATUS = {
    PENDING:   "Pending",
    COMPLETED: "Completed",
    FAILED:    "Failed"
};

const REFUND_STATUSES = Object.values(REFUND_STATUS);

const RAZORPAY_WEBHOOK_EVENTS = [
    "payment.authorized",
    "payment.captured",
    "payment.failed",
    "payment.refunded",
    "refund.created",
    "refund.processed"
];

// Master list of all supported webhook events across gateways
const WEBHOOK_EVENTS = [
    ...RAZORPAY_WEBHOOK_EVENTS
];

module.exports = {
    PAYMENT_GATEWAYS,
    PAYMENT_METHODS,
    PAYMENT_STATUS,
    PAYMENT_STATUSES,
    REFUND_STATUS,
    REFUND_STATUSES,
    RAZORPAY_WEBHOOK_EVENTS,
    WEBHOOK_EVENTS
};
