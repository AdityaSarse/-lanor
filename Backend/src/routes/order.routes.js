const express = require("express");
const router  = express.Router();

const orderController = require("../controllers/order.controller");

const validate                  = require("../middelwares/validation.middleware");
const { verifyJWT, verifyRole } = require("../middelwares/auth.middleware");

const {
    createOrderValidator,
    updateOrderStatusValidator,
    cancelOrderValidator,
    orderIdValidator,
    getOrdersValidator
} = require("../validators/order.validator");

// ─────────────────────────────────────────────────────────────────────────────
// All Order Routes are Protected (require authentication)
// ─────────────────────────────────────────────────────────────────────────────
router.use(verifyJWT);

// POST /api/v1/orders — Place a new order from active cart
router.post(
    "/",
    createOrderValidator,
    validate,
    orderController.createOrder
);

// GET /api/v1/orders — Fetch list of orders (customer sees own, admin sees all)
router.get(
    "/",
    getOrdersValidator,
    validate,
    orderController.getOrders
);

// GET /api/v1/orders/:id — Fetch a single order by ID
router.get(
    "/:id",
    orderIdValidator,
    validate,
    orderController.getOrderById
);

// PATCH /api/v1/orders/:id/cancel — Cancel an order (customer/admin)
router.patch(
    "/:id/cancel",
    cancelOrderValidator,
    validate,
    orderController.cancelOrder
);

// PATCH /api/v1/orders/:id/status — Admin status transition
router.patch(
    "/:id/status",
    verifyRole("admin"),
    updateOrderStatusValidator,
    validate,
    orderController.updateOrderStatus
);

module.exports = router;
