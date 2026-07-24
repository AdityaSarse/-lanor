const { body, param, query } = require("express-validator");
const {
    ORDER_STATUSES,
    PAYMENT_METHODS
} = require("../constants/order.constants");

// ─────────────────────────────────────────────────────────────────────────────
// Order Validators
// ─────────────────────────────────────────────────────────────────────────────

// ─── Create Order (Customer) ──────────────────────────────────────────────────
// Products, quantities, and prices are NOT accepted from the client request.
// They are fetched and calculated directly from the user's cart in the service layer.
// paymentGateway is derived in the service layer based on paymentMethod (e.g. COD → Cash).
const createOrderValidator = [
    body("addressId")
        .notEmpty()
        .withMessage("Shipping address ID is required")
        .bail()
        .isMongoId()
        .withMessage("Invalid address ID"),

    body("paymentMethod")
        .trim()
        .notEmpty()
        .withMessage("Payment method is required")
        .bail()
        .isIn(PAYMENT_METHODS)
        .withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(", ")}`),

    body("couponCode")
        .optional({ values: "falsy" })
        .trim()
        .customSanitizer((value) => (value ? value.toUpperCase() : ""))
        .isLength({ min: 3, max: 30 })
        .withMessage("Coupon code must be between 3 and 30 characters")
        .matches(/^[A-Z0-9_-]+$/)
        .withMessage("Coupon code may only contain letters, numbers, hyphens, and underscores"),

    body("customerNote")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Customer note cannot exceed 500 characters")
];

// ─── Update Order Status (Admin) ──────────────────────────────────────────────
// Embeds param("id") so the route param is validated alongside the body.
const updateOrderStatusValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid order ID"),

    body("status")
        .trim()
        .notEmpty()
        .withMessage("Order status is required")
        .bail()
        .isIn(ORDER_STATUSES)
        .withMessage(`Status must be one of: ${ORDER_STATUSES.join(", ")}`),

    body("adminNote")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Admin note cannot exceed 500 characters")
];

// ─── Cancel Order (Customer) ──────────────────────────────────────────────────
// Embeds param("id") so the route param is validated alongside the body.
const cancelOrderValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid order ID"),

    body("reason")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Cancellation reason cannot exceed 500 characters")
];

// ─── Order ID Validator (Reusable) ────────────────────────────────────────────
const orderIdValidator = [
    param("id")
        .isMongoId()
        .withMessage("Invalid order ID")
];

// ─── Get Orders Validator (Pagination & Filter Query) ─────────────────────────
const getOrdersValidator = [
    query("page")
        .optional({ values: "falsy" })
        .isInt({ min: 1 })
        .withMessage("Page must be an integer greater than 0"),

    query("limit")
        .optional({ values: "falsy" })
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100"),

    query("status")
        .optional({ values: "falsy" })
        .trim()
        .isIn(ORDER_STATUSES)
        .withMessage(`Status filter must be one of: ${ORDER_STATUSES.join(", ")}`)
];

module.exports = {
    createOrderValidator,
    updateOrderStatusValidator,
    cancelOrderValidator,
    orderIdValidator,
    getOrdersValidator
};
