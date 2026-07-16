const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        // No unique: true — "Shoes" can exist under both Men and Women
        name: {
            type: String,
            required: true,
            trim: true
        },

        // slug is the unique identifier, not name
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true
        },

        // Self-referencing parent — null = root category
        // e.g.  Women → null  |  Tops → Women_ID  |  T-Shirts → Tops_ID
        // Indexed because Category.find({ parent: id }) is a very common query
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
            index: true
        },

        // Depth in the tree — set on creation, avoids recalculating every time
        // Women = 0  |  Tops = 1  |  T-Shirts = 2
        level: {
            type: Number,
            default: 0
        },

        // Controls menu/listing order — sort by displayOrder: 1
        displayOrder: {
            type: Number,
            default: 0
        },

        // Rich image object for SEO & accessibility
        image: {
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

        // Optional icon for mobile menus / nav bars
        icon: {
            type: String,
            trim: true,
            default: ""
        },

        description: {
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

        // Soft delete — null = alive; set to new Date() to "delete"
        deletedAt: {
            type: Date,
            default: null
        },

        // SEO metadata for category landing pages (e.g. /women/tops)
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
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// ─── Compound Index ───────────────────────────────────────────────────────────
// Speeds up: Category.find({ parent: id }).sort({ displayOrder: 1 })
categorySchema.index({ parent: 1, displayOrder: 1 });

// ─── Virtual: isRoot ──────────────────────────────────────────────────────────
// true when this is a top-level category (Women, Men, Kids…)
categorySchema.virtual("isRoot").get(function () {
    return this.parent === null;
});

module.exports = mongoose.model("Category", categorySchema);
