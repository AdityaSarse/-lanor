const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        // Unique URL-friendly identifier — indexed for fast slug lookups
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        // Rich logo object for SEO & accessibility
        logo: {
            url: {
                type: String,
                trim: true,
                default: ""
            },
            alt: {
                type: String,
                trim: true,
                default: ""
            }
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        website: {
            type: String,
            trim: true,
            default: ""
        },

        country: {
            type: String,
            trim: true,
            default: ""
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },

        // SEO metadata for brand landing pages (e.g. /brands/nike)
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
        },

        // Soft delete — null = alive; set to new Date() to "delete"
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON:   { virtuals: true },
        toObject: { virtuals: true }
    }
);

// ─── Index: Full-text search ──────────────────────────────────────────────────
// Enables $text queries on name and description.
// Required — without this, MongoDB throws: text index required for $text query
brandSchema.index(
    { name: "text", description: "text" },
    { weights: { name: 10, description: 1 }, name: "brand_text_search" }
);

module.exports = mongoose.model("Brand", brandSchema);
