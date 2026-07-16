const mongoose = require("mongoose");

// ─── Sub-schema: Single item inside the cart ──────────────────────────────────
const cartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        // Color stored as {name, hex} — matches the product variant schema
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
            min: [1, "Quantity must be at least 1"],
            default: 1
        },

        // Price snapshot at the moment the item was added to cart.
        // Protects against price changes affecting an in-progress cart.
        // At checkout, you can decide: honor this price, or re-sync with current price.
        priceAtAdded: {
            type: Number,
            required: true,
            min: 0
        },

        // Timestamp for when this specific item was added
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
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// ─── Virtual: totalItems ──────────────────────────────────────────────────────
// Total number of individual units across all line items
// e.g. 2× Black M + 1× White L = 3
cartSchema.virtual("totalItems").get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ─── Virtual: totalAmount ─────────────────────────────────────────────────────
// Cart value based on priceAtAdded — used for summary display
// Actual final price is recalculated at checkout
cartSchema.virtual("totalAmount").get(function () {
    return this.items.reduce(
        (sum, item) => sum + item.priceAtAdded * item.quantity,
        0
    );
});

module.exports = mongoose.model("Cart", cartSchema);
