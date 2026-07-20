const mongoose = require("mongoose");

// ─── Sub-schema: Size entry within a variant ─────────────────────────────────
const sizeSchema = new mongoose.Schema(
    {
        size: {
            type: String,
            required: true,
            trim: true,
            enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    },
    { _id: false }
);

// ─── Sub-schema: Color variant containing multiple sizes ──────────────────────
const variantSchema = new mongoose.Schema(
    {
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
                // e.g. "#23395d"
            }
        },
        sizes: {
            type: [sizeSchema],
            required: true
        }
    },
    { _id: false }
);

// ─── Sub-schema: Image entry ──────────────────────────────────────────────────
const imageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true
        },
        alt: {
            type: String,
            trim: true,
            default: ""
        }
    },
    { _id: false }
);

// ─── Main Product Schema ──────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        // Indexed for fast URL lookups
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        gender: {
            type: String,
            required: true,
            enum: ["Men", "Women", "Unisex", "Kids"]
        },

        // ObjectId refs — update the source once, reflects everywhere
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },

        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        discount: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },

        // finalPrice is a virtual — no stored field (see below)

        currency: {
            type: String,
            default: "INR",
            trim: true
        },

        // Rich image objects for SEO & accessibility
        images: {
            type: [imageSchema],
            default: []
        },

        variants: {
            type: [variantSchema],
            required: true
        },

        material: {
            type: String,
            trim: true,
            default: ""
        },

        fit: {
            type: String,
            trim: true,
            enum: ["Slim", "Regular", "Relaxed", "Oversized", ""],
            default: ""
        },

        // Aggregated from reviews — updated by review service
        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },

        reviewCount: {
            type: Number,
            min: 0,
            default: 0
        },

        // e.g. ["New", "Trending", "Summer", "Sale", "Best Seller"]
        tags: {
            type: [String],
            default: []
        },

        status: {
            type: String,
            enum: ["active", "inactive", "out_of_stock"],
            default: "active"
        },

        // Soft delete — null means alive; set to new Date() to "delete"
        deletedAt: {
            type: Date,
            default: null
        },

        // Admin can save a draft without making it visible
        isPublished: {
            type: Boolean,
            default: true
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        // SEO metadata
        seo: {
            title: {
                type: String,
                trim: true,
                default: ""
            },
            description: {
                type: String,
                trim: true,
                default: ""
            }
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },   // include virtuals when serialising
        toObject: { virtuals: true }
    }
);

// ─── Index: Full-text search ──────────────────────────────────────────────────
// Enables $text queries across the three most search-relevant fields.
// MongoDB only allows one text index per collection, so all fields are
// combined here. Add weights if you want name matches to rank higher.
productSchema.index(
    { name: "text", description: "text", tags: "text" },
    { weights: { name: 10, tags: 5, description: 1 }, name: "product_text_search" }
);

// ─── Virtual: finalPrice ──────────────────────────────────────────────────────
// Always derived from price & discount — never stale, never out of sync
productSchema.virtual("finalPrice").get(function () {
    return Math.round(this.price - (this.price * this.discount) / 100);
});

module.exports = mongoose.model("Product", productSchema);
