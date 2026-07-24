const mongoose = require("mongoose");
const {
    ORDER_STATUSES,
    PAYMENT_METHODS,
    PAYMENT_STATUSES,
    PAYMENT_GATEWAYS
} = require("../constants/order.constants");
const { ADDRESS_TYPES } = require("../constants/address.constants");
const { DISCOUNT_TYPES } = require("../constants/coupon.constants");

// ─────────────────────────────────────────────────────────────────────────────
// WHY SNAPSHOTS?
//
// Products change:  names, prices, images all update over time.
// Addresses change: users edit or delete saved addresses.
// Orders must NOT change: an order is a permanent historical record.
//
// Solution → embed full snapshots of product & address data at checkout time.
// This intentionally duplicates data — that's correct e-commerce design.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Sub-schema: Single line item inside an order ─────────────────────────────
const orderItemSchema = new mongoose.Schema(
    {
        // Keep the reference for admin lookups / analytics, but the
        // snapshot fields below are the real source of truth for the order.
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        // ── Product snapshot (frozen at checkout) ──────────────────────────
        productName: {
            type: String,
            required: [true, "Product name snapshot is required"],
            trim: true
        },

        slug: {
            type: String,
            required: [true, "Product slug snapshot is required"],
            trim: true
        },

        category: {
            type: String,
            trim: true,
            default: ""
        },

        // Brand at time of purchase — useful for invoices and brand analytics
        brand: {
            type: String,
            required: [true, "Brand snapshot is required"],
            trim: true
        },

        // SKU at time of purchase — stays accurate even if product is archived
        sku: {
            type: String,
            required: [true, "SKU snapshot is required"],
            trim: true
        },

        // Primary product image at the time of purchase
        // Stored as {url, alt} — consistent with the Product schema
        image: {
            url: {
                type: String,
                required: [true, "Product image URL snapshot is required"],
                trim: true
            },
            alt: {
                type: String,
                trim: true,
                default: ""
            }
        },

        // Color the customer chose — stored as {name, hex} to match the
        // product variant schema and render correctly without a DB lookup
        color: {
            name: {
                type: String,
                required: true,
                trim: true
            },
            hex: {
                type: String,
                trim: true,
                default: ""
            }
        },

        size: {
            type: String,
            required: true,
            trim: true,
            enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"]
        },

        // Price per unit at the exact moment the order was placed
        price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"]
        },

        // quantity × price — stored so totals never need recalculation
        subtotal: {
            type: Number,
            required: true,
            min: [0, "Subtotal cannot be negative"]
        }
    },
    { _id: true } // keep _id for line-item-level operations (e.g. returns)
);

// ─── Sub-schema: Shipping address snapshot ────────────────────────────────────
// Full copy of the address at checkout — never a reference to Address collection.
// This ensures old orders always show the correct delivery address even if the
// user later edits or deletes that address.
const shippingAddressSchema = new mongoose.Schema(
    {
        fullName:     { type: String, required: true, trim: true },
        phone:        { type: String, required: true, trim: true },
        addressLine1: { type: String, required: true, trim: true },
        addressLine2: { type: String, trim: true, default: "" },
        landmark:     { type: String, trim: true, default: "" },
        city:         { type: String, required: true, trim: true },
        state:        { type: String, required: true, trim: true },
        country:      { type: String, required: true, trim: true, default: "India" },
        postalCode:   { type: String, required: true, trim: true },
        addressType:  { type: String, enum: ADDRESS_TYPES, default: "Home" }
    },
    { _id: false } // it's a snapshot, not an independent document
);

// ─── Sub-schema: Payment information ─────────────────────────────────────────
const paymentSchema = new mongoose.Schema(
    {
        // Gateway: Cash (for COD), Razorpay, Stripe, etc.
        gateway: {
            type: String,
            required: true,
            enum: PAYMENT_GATEWAYS,
            default: "Cash"
        },

        // Method: COD, Card, UPI, Net Banking, Wallet
        method: {
            type: String,
            required: true,
            enum: PAYMENT_METHODS,
            default: "COD"
        },

        status: {
            type: String,
            required: true,
            enum: PAYMENT_STATUSES,
            default: "Pending"
        },

        // Payment gateway transaction/order identifiers
        transactionId: {
            type: String,
            trim: true,
            default: ""
        },

        gatewayOrderId: {
            type: String,
            trim: true,
            default: ""
        },

        gatewayPaymentId: {
            type: String,
            trim: true,
            default: ""
        },

        gatewaySignature: {
            type: String,
            trim: true,
            default: ""
        }
    },
    { _id: false }
);

// ─── Sub-schema: Coupon applied to the order ──────────────────────────────────
// Preserves full details of how the discount was calculated at checkout time
const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            trim: true,
            uppercase: true,
            default: ""
        },

        discountType: {
            type: String,
            enum: [...DISCOUNT_TYPES, ""],
            default: ""
        },

        discountValue: {
            type: Number,
            min: [0, "Discount value cannot be negative"],
            default: 0
        },

        discountApplied: {
            type: Number,
            min: [0, "Discount applied cannot be negative"],
            default: 0
        }
    },
    { _id: false }
);

// ─── Sub-schema: Status history entry ────────────────────────────────────────
// Powers the order tracking timeline shown to customers.
// Every time orderStatus changes, push a new entry here.
const statusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            required: true,
            enum: ORDER_STATUSES
        },

        // When this status was applied
        changedAt: {
            type: Date,
            default: Date.now
        },

        // Who made the status change: "system", "customer", or admin user ID
        changedBy: {
            type: String,
            trim: true,
            default: "system"
        }
    },
    { _id: false }
);

// ─── Sub-schema: Pricing breakdown ───────────────────────────────────────────
const pricingSchema = new mongoose.Schema(
    {
        // Sum of all item subtotals before any deductions
        subtotal: {
            type: Number,
            required: true,
            min: [0, "Subtotal cannot be negative"]
        },

        // Amount saved via coupon or promotion
        discount: {
            type: Number,
            default: 0,
            min: [0, "Discount cannot be negative"]
        },

        // Delivery fee — 0 for free shipping
        shippingFee: {
            type: Number,
            default: 0,
            min: [0, "Shipping fee cannot be negative"]
        },

        // GST or other applicable tax
        tax: {
            type: Number,
            default: 0,
            min: [0, "Tax cannot be negative"]
        },

        // Final amount charged: subtotal - discount + shippingFee + tax
        total: {
            type: Number,
            required: true,
            min: [0, "Total cannot be negative"]
        }
    },
    { _id: false }
);

// ─── Order Schema ─────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
    {
        // Human-readable order identifier shown to the customer
        // Format: ORD-YYYYMMDD-XXXXXX  →  e.g. ORD-20260717-000123
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },

        // The customer who placed the order
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // One or more products in this order
        items: {
            type: [orderItemSchema],
            validate: {
                validator: (arr) => arr.length > 0,
                message: "An order must contain at least one item"
            }
        },

        // Full address copy — never reference Address collection on an order
        shippingAddress: {
            type: shippingAddressSchema,
            required: true
        },

        // Pricing breakdown
        pricing: {
            type: pricingSchema,
            required: true
        },

        // Payment details embedded
        payment: {
            type: paymentSchema,
            required: true
        },

        // ─── Order lifecycle status ────────────────────────────────────────
        orderStatus: {
            type: String,
            enum: ORDER_STATUSES,
            default: "Pending"
        },

        // ─── Coupon snapshot ───────────────────────────────────────────────
        // Preserved here even if the coupon is later deleted
        coupon: {
            type: couponSchema,
            default: () => ({}) // always present, just empty if no coupon used
        },

        // ─── Status history (order tracking timeline) ──────────────────────
        // Append a new entry every time orderStatus changes.
        // Powers the live tracking page customers see.
        statusHistory: {
            type: [statusHistorySchema],
            default: []
        },

        // ─── Notes ─────────────────────────────────────────────────────────
        customerNote: {
            type: String,
            trim: true,
            default: "",
            maxlength: [500, "Customer note cannot exceed 500 characters"]
        },

        adminNote: {
            type: String,
            trim: true,
            default: "",
            maxlength: [500, "Admin note cannot exceed 500 characters"]
        },

        // ─── Delivery dates ────────────────────────────────────────────────
        // Expected delivery date communicated to the customer at checkout
        estimatedDelivery: {
            type: Date,
            default: null
        },

        // Set when orderStatus changes to "Delivered"
        deliveredAt: {
            type: Date,
            default: null
        },

        // Set when orderStatus changes to "Cancelled"
        cancelledAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true // createdAt = when the order was placed, updatedAt = last status change
    }
);

// ─── Compound index ───────────────────────────────────────────────────────────
// Almost every "My Orders" page runs:
//   Order.find({ user }).sort({ createdAt: -1 })
// This index makes that query fast even with millions of orders.
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
