// ─────────────────────────────────────────────────────────────────────────────
// Product Constants
//
// Single source of truth for values that are shared across:
//   - models  (enum arrays)
//   - validators (isIn checks)
//   - services  (business logic guards)
//
// Add a new size or currency here and every module picks it up automatically.
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const PRODUCT_CURRENCIES = ["INR", "USD", "EUR", "GBP"];

const PRODUCT_STATUSES = ["active", "draft", "inactive"];

module.exports = {
    PRODUCT_SIZES,
    PRODUCT_CURRENCIES,
    PRODUCT_STATUSES
};
