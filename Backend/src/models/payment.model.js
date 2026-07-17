const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN DECISIONS
//
// 1. Separate collection — payment is not just a status field on Order.
//    It's a full financial record: amounts, gateway IDs, refunds, timestamps.
//    Keeping it separate also makes it easy to support retries or partial
//    payments in future without touching the Order schema.
//
// 2. One Payment per Order (v1) — enforced by a unique index on `order`.
//    Multiple attempts / split payments can be handled in v2.
//
// 3. Gateway-agnostic fields — gatewayOrderId, gatewayPaymentId, transactionId
//    work across Razorpay, Stripe, PayU, and others without schema changes.
//
// 4. Amount is stored here, not recalculated from Order.
//    At the time of payment the amount is final — source of truth.
//
// 5. Refund fields are included now so refund flows don't require migrations.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Payment Schema ───────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema(
    {
        // The order this payment belongs to
        // unique: one payment record per order (v1)
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: [true, "Order reference is required"],
            unique: true,
            index: true
        },

        // The customer who made the payment — stored here for fast admin queries
        // without always needing to join through Order
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            index: true
        },

        // ─── Amount ───────────────────────────────────────────────────────────
        // Actual amount charged — never recalculate from Order totals.
        // This is the ground truth for finance and reconciliation.
        amount: {
            type: Number,
            required: [true, "Payment amount is required"],
            min: [0, "Amount cannot be negative"]
        },

        // ISO 4217 currency code — default INR for this store
        currency: {
            type: String,
            default: "INR",
            trim: true,
            uppercase: true
        },

        // ─── Payment method ───────────────────────────────────────────────────
        method: {
            type: String,
            required: [true, "Payment method is required"],
            enum: {
                values: ["COD", "UPI", "Card", "Net Banking", "Wallet"],
                message: "Invalid payment method"
            }
        },

        // ─── Gateway information ──────────────────────────────────────────────
        // Generic fields — work for Razorpay, Stripe, PayU, etc.
        // Leave empty for COD orders.

        // Name of the payment gateway used — e.g. "Razorpay", "Stripe"
        gateway: {
            type: String,
            trim: true,
            default: ""
        },

        // ID created by the gateway when the order is initiated
        // Razorpay: razorpay_order_id
        gatewayOrderId: {
            type: String,
            trim: true,
            default: ""
        },

        // ID returned by the gateway after the payment is completed
        // Razorpay: razorpay_payment_id
        gatewayPaymentId: {
            type: String,
            trim: true,
            default: ""
        },

        // Internal or gateway-issued transaction reference
        // Used for support queries and reconciliation
        transactionId: {
            type: String,
            trim: true,
            default: ""
        },

        // ─── Payment status ───────────────────────────────────────────────────
        // Lifecycle for online payments:
        //   Pending → Authorized → Captured → Failed / Refunded
        //
        // Lifecycle for COD:
        //   Pending → Paid  (marked Paid on delivery confirmation)
        status: {
            type: String,
            required: [true, "Payment status is required"],
            enum: {
                values: [
                    "Pending",      // payment initiated, awaiting action
                    "Authorized",   // card/UPI authorized but not yet captured
                    "Captured",     // amount successfully captured by gateway
                    "Paid",         // used for COD — marked paid on delivery
                    "Failed",       // payment attempt failed
                    "Refunded"      // full or partial refund processed
                ],
                message: "Invalid payment status"
            },
            default: "Pending"
        },

        // ─── Refund information ───────────────────────────────────────────────
        // Included now so refund flows don't require a schema migration later.

        // Actual amount refunded — may be less than full amount (partial refund)
        refundAmount: {
            type: Number,
            default: 0,
            min: [0, "Refund amount cannot be negative"]
        },

        // Reason provided by the customer or admin for the refund
        refundReason: {
            type: String,
            trim: true,
            default: ""
        },

        // Timestamp when the refund was processed by the gateway
        refundedAt: {
            type: Date,
            default: null
        },

        // ─── Completion timestamp ─────────────────────────────────────────────
        // Set by the service layer when status changes to "Captured" or "Paid"
        paidAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true // createdAt, updatedAt
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
