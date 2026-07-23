const mongoose = require("mongoose");
const { DISCOUNT_TYPES } = require("../constants/coupon.constants");

// ─── Coupon Schema ────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema(
    {
        // Coupon code entered by the customer at checkout
        // e.g. WELCOME20, FLAT500
        // Stored in uppercase to make lookups case-insensitive by convention
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            index: true
        },

        // ─── Discount type and value ──────────────────────────────────────────
        // "Percentage" → deduct X% of cart value    e.g. 20% off
        // "Fixed"      → deduct flat ₹ amount       e.g. ₹500 off
        discountType: {
            type: String,
            required: [true, "Discount type is required"],
            enum: {
                values: DISCOUNT_TYPES,
                message: `Discount type must be one of: ${DISCOUNT_TYPES.join(", ")}`
            }
        },

        // The discount amount — interpreted based on discountType:
        //   Percentage → 0–100 (%)
        //   Fixed      → flat currency amount (₹)
        discountValue: {
            type: Number,
            required: [true, "Discount value is required"],
            min: [0, "Discount value cannot be negative"],
            validate: {
                // Prevent nonsensical values like 500% off.
                // For Fixed coupons, any positive number is valid.
                validator: function (v) {
                    return this.discountType === "Fixed" || v <= 100;
                },
                message: "Percentage discount cannot exceed 100%"
            }
        },

        // Admin-facing note describing the purpose of the coupon
        // e.g. "Independence Day Sale", "New user onboarding"
        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: [300, "Description cannot exceed 300 characters"]
        },

        // ─── Order constraints ────────────────────────────────────────────────

        // Minimum cart value required to apply the coupon
        // e.g. "20% OFF on orders above ₹2000"
        minimumOrder: {
            type: Number,
            default: 0,
            min: [0, "Minimum order value cannot be negative"]
        },

        // Maximum discount that can be granted — mainly caps Percentage coupons.
        // e.g. 20% off BUT not more than ₹500.
        // Set to null / 0 to mean "no cap".
        // Service layer: if (discount > maximumDiscount) discount = maximumDiscount
        maximumDiscount: {
            type: Number,
            default: 0, // 0 = no cap
            min: [0, "Maximum discount cannot be negative"]
        },

        // ─── Usage limits ─────────────────────────────────────────────────────

        // Total number of times this coupon can be used across all users
        // e.g. WELCOME20 is limited to 10,000 total redemptions
        // 0 = unlimited
        usageLimit: {
            type: Number,
            default: 0,
            min: [0, "Usage limit cannot be negative"]
        },

        // Maximum number of times a single user can use this coupon
        // e.g. WELCOME20 should only be used once per account
        usagePerUser: {
            type: Number,
            default: 1,
            min: [1, "Usage per user must be at least 1"]
        },

        // Running count of how many times this coupon has been redeemed
        // Incremented by the service layer every time the coupon is applied at checkout
        usedCount: {
            type: Number,
            default: 0,
            min: [0, "Used count cannot be negative"]
        },

        // ─── Validity window ──────────────────────────────────────────────────

        // Coupon becomes active on this date
        validFrom: {
            type: Date,
            required: [true, "Valid-from date is required"]
        },

        // Coupon expires at the end of this date
        validUntil: {
            type: Date,
            required: [true, "Valid-until date is required"]
        },

        // ─── Status ───────────────────────────────────────────────────────────
        // Admins can disable a coupon instantly without deleting it.
        // Service layer checks: isActive && within date range && under usageLimit
        isActive: {
            type: Boolean,
            default: true
        },

        // ─── Soft delete ──────────────────────────────────────────────────────
        // Preserves promotion history — never hard-delete a coupon.
        // Filter active coupons with: { deletedAt: null }
        deletedAt: {
            type: Date,
            default: null
        },

        // ─── Applicability (v2) ───────────────────────────────────────────────
        // Currently applies to the entire cart (all arrays left empty = no restriction).
        // Populate specific arrays to restrict the coupon's scope.
        applicableTo: {
            products: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                }
            ],
            categories: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Category"
                }
            ],
            brands: [String]
        }
    },
    {
        timestamps: true // createdAt, updatedAt
    }
);

// ─── Path validator: validUntil must be after validFrom ───────────────────────
// Prevents creating a coupon where the window is already closed.
// e.g. validFrom: 10 Aug, validUntil: 5 Aug ❌
couponSchema.path("validUntil").validate(function (value) {
    return value > this.validFrom;
}, "Valid-until date must be after the valid-from date");

// ─── Compound indexes ─────────────────────────────────────────────────────────
// Coupon lookups almost always include code + one of these conditions,
// so we index both common query shapes.
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ code: 1, deletedAt: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
