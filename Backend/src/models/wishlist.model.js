const mongoose = require("mongoose");

// ─── Sub-schema: Single product entry inside the wishlist ─────────────────────
const wishlistItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        // When was this product added to the wishlist
        // Useful for showing "Added 2 days ago" in the UI
        addedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true } // each entry gets its own _id — lets frontend delete a single item cleanly via its _id
);

// ─── Wishlist Schema ──────────────────────────────────────────────────────────
const wishlistSchema = new mongoose.Schema(
    {
        // One wishlist per user — enforced by unique index
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        // Array of liked products.
        // No price, no quantity, no color, no size.
        // "I like this product." — that's it.
        // Latest price is always fetched live from the Product collection.
        products: {
            type: [wishlistItemSchema],
            default: []
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// ─── Duplicate prevention note ────────────────────────────────────────────────
// MongoDB does not enforce uniqueness inside array sub-documents natively.
// Duplicates are prevented in the service/controller layer:
//   - Use $addToSet (won't work on sub-docs with multiple fields), OR
//   - Check if "products.product": productId exists before running $push
// This keeps the same product from appearing twice when ❤️ is clicked multiple times.

// ─── Virtual: wishlistCount ───────────────────────────────────────────────────
// Returns the total number of products saved in this wishlist.
// e.g. 12 products → wishlistCount = 12
wishlistSchema.virtual("wishlistCount").get(function () {
    return this.products.length;
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
