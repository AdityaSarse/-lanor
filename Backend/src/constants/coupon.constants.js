// ─────────────────────────────────────────────────────────────────────────────
// Coupon Constants
//
// Single source of truth for values that are shared across:
//   - models     (enum arrays)
//   - validators (isIn checks)
//   - services   (business logic guards)
//
// Add a new discount type here and every module picks it up automatically.
// ─────────────────────────────────────────────────────────────────────────────

const DISCOUNT_TYPES = ["Percentage", "Fixed"];

module.exports = {
    DISCOUNT_TYPES
};
