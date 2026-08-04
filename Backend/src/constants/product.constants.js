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

const PRODUCT_SIZES = [
    "XS", "S", "M", "L", "XL", "XXL", "XXXL",
    "32B", "34B", "34C", "36B", "36C", "36D", "38B", "38D",
    "28", "30", "32", "34", "36", "38"
];

const PRODUCT_CURRENCIES = ["INR", "USD", "EUR", "GBP"];

const PRODUCT_STATUSES = ["active", "draft", "inactive"];

module.exports = {
    PRODUCT_SIZES,
    PRODUCT_CURRENCIES,
    PRODUCT_STATUSES
};
