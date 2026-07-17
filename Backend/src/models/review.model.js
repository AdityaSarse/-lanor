const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN DECISIONS
//
// 1. Separate collection — a popular product can have 250,000+ reviews.
//    Embedding in Product would make that document unmanageably large.
//
// 2. One review per user per product — enforced by a compound unique index.
//    Users edit their existing review rather than creating a new one.
//
// 3. Order reference — ties the review to a real purchase.
//    Enables a "Verified Purchase" badge without extra DB queries.
//    The service layer enforces: only users with a Delivered order can review.
//    The schema itself stays clean — no business logic here.
//
// 4. Denormalized stats on Product — averageRating and reviewCount are stored
//    directly on the Product document and updated whenever a review is
//    created, edited, or deleted (handled in the service layer).
// ─────────────────────────────────────────────────────────────────────────────

// ─── Sub-schema: Review image ─────────────────────────────────────────────────
// Consistent with the image format used across Product and Order schemas.
const reviewImageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: [true, "Image URL is required"],
            trim: true
        },

        // Descriptive alt text — used by screen readers and as a fallback
        alt: {
            type: String,
            trim: true,
            default: ""
        }
    },
    { _id: false } // no need for a separate _id on each image object
);

// ─── Review Schema ────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
    {
        // The user who wrote this review
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true
        },

        // The product being reviewed
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product is required"],
            index: true
        },

        // The delivered order that proves this is a verified purchase.
        // Service layer checks: order must exist, belong to this user,
        // contain this product, and have status "Delivered".
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: [true, "Order reference is required for a verified review"]
        },

        // ─── Review content ───────────────────────────────────────────────────

        // 1–5 star rating
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"]
        },

        // Short headline — optional but encouraged
        title: {
            type: String,
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
            default: ""
        },

        // Full review text — optional (a star rating alone is valid)
        comment: {
            type: String,
            trim: true,
            maxlength: [1000, "Comment cannot exceed 1000 characters"],
            default: ""
        },

        // Customer-uploaded photos of the product — optional
        // Consistent {url, alt} format used across Product and Order schemas
        images: {
            type: [reviewImageSchema],
            default: [],
            validate: {
                validator: (arr) => arr.length <= 5,
                message: "A review cannot have more than 5 images"
            }
        }

        // ─── Helpful votes (v2) ───────────────────────────────────────────────
        // helpfulCount will be added in v2 when "👍 Helpful (23)" feature lands.
    },
    {
        timestamps: true // createdAt, updatedAt
    }
);

// ─── Compound unique index: one review per user per product ───────────────────
// Prevents a user from submitting the same product twice.
// To change a review, the user edits the existing document — no new insert.
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
