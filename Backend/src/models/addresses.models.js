const mongoose = require("mongoose");

// ─── Address Schema ───────────────────────────────────────────────────────────
// Separate collection — one user can have many addresses.
// Cleaner, more scalable, and easier to CRUD than embedding in User.
//
// ⚠️   Orders do NOT reference this document.
//     Orders store a snapshot of the shipping address at checkout time.
//     This way, editing or deleting an address never corrupts order history.
const addressSchema = new mongoose.Schema(
    {
        // The owner of this address
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // ─── Recipient details ────────────────────────────────────────────────
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },

        // ─── Address lines ────────────────────────────────────────────────────
        addressLine1: {
            type: String,
            required: [true, "Address line 1 is required"],
            trim: true
        },

        // Apartment / Floor / Suite — optional
        addressLine2: {
            type: String,
            trim: true,
            default: ""
        },

        // Nearby landmark to help delivery — optional
        landmark: {
            type: String,
            trim: true,
            default: ""
        },

        // ─── Location ─────────────────────────────────────────────────────────
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },

        state: {
            type: String,
            required: [true, "State is required"],
            trim: true
        },

        country: {
            type: String,
            required: [true, "Country is required"],
            trim: true,
            default: "India"
        },

        postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            trim: true
        },

        // ─── Address type ─────────────────────────────────────────────────────
        // Helps the user label and quickly identify saved addresses
        type: {
            type: String,
            enum: ["Home", "Office", "Other"],
            default: "Home"
        },

        // ─── Default flag ─────────────────────────────────────────────────────
        // Only ONE address per user should have isDefault: true.
        // Enforced at the service layer:
        //   Before setting a new default → unset the current one first.
        isDefault: {
            type: Boolean,
            default: false
        }

        // ─── No coordinates (v1) ──────────────────────────────────────────────
        // Latitude / longitude omitted intentionally.
        // Can be added later for map-based features or delivery radius checks.
    },
    {
        timestamps: true // createdAt, updatedAt
    }
);

module.exports = mongoose.model("Address", addressSchema);
