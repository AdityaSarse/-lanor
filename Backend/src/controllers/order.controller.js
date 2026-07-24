const asyncHandler  = require("../utils/asyncHandler");
const ApiResponse   = require("../utils/ApiResponse");
const orderService  = require("../services/order.service");

// ─────────────────────────────────────────────────────────────────────────────
// Order Controller
// ─────────────────────────────────────────────────────────────────────────────

// ─── Create Order (Customer) ──────────────────────────────────────────────────
// POST /api/v1/orders
const createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.user._id, req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, order, "Order placed successfully"));
});

// ─── Get Orders (Customer / Admin) ────────────────────────────────────────────
// GET /api/v1/orders
const getOrders = asyncHandler(async (req, res) => {
    const { orders, total, page, totalPages } = await orderService.getOrders(
        req.user._id,
        req.user.role,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            orders,
            "Orders fetched successfully",
            { total, page, totalPages }
        )
    );
});

// ─── Get Order By ID (Customer / Admin) ───────────────────────────────────────
// GET /api/v1/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(
        req.params.id,
        req.user._id,
        req.user.role
    );

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// ─── Update Order Status (Admin) ──────────────────────────────────────────────
// PATCH /api/v1/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, adminNote } = req.body;

    const order = await orderService.updateOrderStatus(
        req.params.id,
        status,
        adminNote,
        req.user._id.toString()
    );

    return res
        .status(200)
        .json(new ApiResponse(200, order, `Order status updated to ${status}`));
});

// ─── Cancel Order (Customer / Admin) ──────────────────────────────────────────
// PATCH /api/v1/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const order = await orderService.cancelOrder(
        req.params.id,
        req.user._id,
        req.user.role,
        reason
    );

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};
