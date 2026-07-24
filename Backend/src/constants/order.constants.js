// ─────────────────────────────────────────────────────────────────────────────
// Order Constants
//
// Single source of truth for order-related enums shared across:
//   - models     (enum arrays)
//   - validators (isIn checks)
//   - services   (business logic guards)
// ─────────────────────────────────────────────────────────────────────────────

const ORDER_STATUSES = [
    "Pending",
    "Confirmed",
    "Packed",
    "Shipped",
    "Out For Delivery",
    "Delivered",
    "Cancelled",
    "Returned",
    "Refunded"
];

const PAYMENT_METHODS = [
    "COD",
    "Card",
    "UPI",
    "Net Banking",
    "Wallet"
];

const PAYMENT_STATUSES = [
    "Pending",
    "Paid",
    "Failed",
    "Refunded"
];

const PAYMENT_GATEWAYS = [
    "Cash",
    "Razorpay",
    "Stripe"
];

module.exports = {
    ORDER_STATUSES,
    PAYMENT_METHODS,
    PAYMENT_STATUSES,
    PAYMENT_GATEWAYS
};
