const mongoose = require("mongoose");
const { PRODUCT_SIZES } = require("../constants/product.constants");

// ─── Sub-schema: Single item inside the cart ──────────────────────────────────
const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        // Color stored as {name, hex} — matches the product variant schema.
        // Used to identify the exact variant without a separate variant collection.
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
            enum: PRODUCT_SIZES
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
            default: 1
        },

        // ── Price snapshot ────────────────────────────────────────────────────
        // Renamed from priceAtAdded → priceSnapshot for naming consistency.
        // Future snapshots (discountSnapshot, taxSnapshot) will follow the same convention.
        // At checkout, you can decide: honor this price, or re-sync with current price.
        priceSnapshot: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"]
        },

        // Timestamp for when this item was added
        // Useful for showing "Added 2 days ago" in the UI
        addedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true } // keep _id so frontend can reference individual line items
);

// ─── Cart Schema ──────────────────────────────────────────────────────────────
const cartSchema = new mongoose.Schema(
    {
        // One cart per user — enforced by unique index
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        items: {
            type: [cartItemSchema],
            default: []
        }

        // ─── Future fields (not needed for v1) ───────────────────────────────
        // coupon:                 { code, discount }   → applied coupon snapshot
        // selectedShippingMethod: String               → shipping option chosen
        // shippingAddress:        ObjectId → Address   → pre-selected address
    },
    {
        timestamps: true,
        toJSON:   { virtuals: true },
        toObject: { virtuals: true }
    }
);

// ─── Virtual: totalItems ──────────────────────────────────────────────────────
// Number of DISTINCT cart lines — e.g. 3 different product/color/size combos.
// Black Shirt ×2 + White Shirt ×1 + Shoes ×4  →  totalItems = 3
cartSchema.virtual("totalItems").get(function () {
    return this.items.length;
});

// ─── Virtual: totalQuantity ───────────────────────────────────────────────────
// Total number of INDIVIDUAL UNITS across all cart lines.
// Black Shirt ×2 + White Shirt ×1 + Shoes ×4  →  totalQuantity = 7
// Used for cart badge counts like "🛒 7".
cartSchema.virtual("totalQuantity").get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ─── Virtual: totalAmount ─────────────────────────────────────────────────────
// Estimated cart value based on priceSnapshot — shown in the cart summary.
// Final price is always recalculated at checkout (coupons, shipping, taxes).
cartSchema.virtual("totalAmount").get(function () {
    return this.items.reduce(
        (sum, item) => sum + item.priceSnapshot * item.quantity,
        0
    );
});

module.exports = mongoose.model("Cart", cartSchema);
