const mongoose = require("mongoose");
const Order    = require("../models/order.model");
const Cart     = require("../models/cart.model");
const Address  = require("../models/addresses.models");
const Product  = require("../models/products.model");
const couponService       = require("./coupon.service");
const cartService         = require("./cart.service");
const notificationService = require("./notification.service");
const ApiError            = require("../utils/ApiError");
const {
    ORDER_STATUSES,
    PAYMENT_METHODS
} = require("../constants/order.constants");

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Allowed State Transitions
// ─────────────────────────────────────────────────────────────────────────────

const ALIVE = { deletedAt: null };

/** Estimated delivery window for standard shipping (5 days) */
const ESTIMATED_DELIVERY_DAYS = 5;

/** Max retries for order creation if orderNumber collision occurs */
const MAX_ORDER_CREATE_RETRIES = 3;

/**
 * Valid order status transitions map.
 * Enforces business logic workflow: e.g. Pending → Confirmed → Packed → Shipped...
 * Terminal states (Delivered, Cancelled, Returned, Refunded) cannot transition.
 */
const ALLOWED_TRANSITIONS = {
    Pending:          ["Confirmed", "Cancelled"],
    Confirmed:        ["Packed", "Cancelled"],
    Packed:           ["Shipped", "Cancelled"],
    Shipped:          ["Out For Delivery"],
    "Out For Delivery": ["Delivered"],
    Delivered:        ["Returned", "Refunded"],
    Cancelled:        [],
    Returned:         ["Refunded"],
    Refunded:         []
};

// ─────────────────────────────────────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the user's cart with populated product details.
 * Throws 404 if cart doesn't exist, 400 if cart is empty.
 *
 * @param {string} userId - Customer ObjectId string.
 * @returns {Promise<Cart>} Populated cart document.
 * @throws {ApiError} 404 | 400
 */
const getCartOrThrow = async (userId) => {
    const cart = await Cart.findOne({ user: userId }).populate({
        path: "items.product",
        select: "name slug price images status deletedAt variants brand category"
    });

    if (!cart || !cart.items || cart.items.length === 0) {
        throw new ApiError(400, "Your cart is empty. Add items before placing an order.");
    }

    return cart;
};

/**
 * Fetches the user's shipping address and verifies ownership.
 *
 * @param {string} userId    - Customer ObjectId string.
 * @param {string} addressId - Address ObjectId string.
 * @returns {Promise<Address>} Address document.
 * @throws {ApiError} 404
 */
const getAddressOrThrow = async (userId, addressId) => {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
        throw new ApiError(404, "Shipping address not found or does not belong to user");
    }
    return address;
};

/**
 * Validates product existence, active status, variant availability, and stock.
 *
 * @param {Cart} cart - Populated Cart document.
 * @throws {ApiError} 400 | 404
 */
const validateCart = (cart) => {
    for (const item of cart.items) {
        const product = item.product;

        if (!product || product.deletedAt !== null) {
            throw new ApiError(404, `A product in your cart is no longer available`);
        }

        if (product.status !== "active") {
            throw new ApiError(400, `Product "${product.name}" is currently unavailable for purchase`);
        }

        const variant = product.variants.find(
            (v) => v.color.name.toLowerCase() === item.color.name.toLowerCase()
        );
        if (!variant) {
            throw new ApiError(404, `Color "${item.color.name}" is no longer available for ${product.name}`);
        }

        const sizeEntry = variant.sizes.find((s) => s.size === item.size);
        if (!sizeEntry) {
            throw new ApiError(404, `Size "${item.size}" is no longer available for ${product.name}`);
        }

        if (sizeEntry.stock < item.quantity) {
            throw new ApiError(
                400,
                sizeEntry.stock === 0
                    ? `"${product.name}" (${item.color.name} / ${item.size}) is out of stock`
                    : `Only ${sizeEntry.stock} unit(s) available for "${product.name}" (${item.color.name} / ${item.size})`
            );
        }
    }
};

/**
 * Builds order item snapshot objects from populated cart line items.
 *
 * @param {Array} cartItems - Populated cart items array.
 * @returns {Array} Order item snapshots.
 */
const buildOrderItems = (cartItems) => {
    return cartItems.map((item) => {
        const product = item.product;
        const price = item.priceSnapshot || product.price;
        const subtotal = Math.round(price * item.quantity * 100) / 100;
        const primaryImage = product.images?.[0] || { url: "", alt: "" };
        const sku = `${product.slug}-${item.color.name}-${item.size}`.toUpperCase();

        return {
            product:       product._id,
            productName:   product.name,
            slug:          product.slug,
            category:      product.category ? product.category.toString() : "",
            brand:         product.brand ? product.brand.toString() : "",
            sku,
            image:         { url: primaryImage.url, alt: primaryImage.alt || product.name },
            color:         { name: item.color.name, hex: item.color.hex || "" },
            size:          item.size,
            quantity:      item.quantity,
            price,
            subtotal
        };
    });
};

/**
 * Builds a shipping address snapshot object from an Address document.
 *
 * @param {Address} address - Mongoose Address document.
 * @returns {Object} Shipping address snapshot.
 */
const buildAddressSnapshot = (address) => ({
    fullName:     address.fullName,
    phone:        address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || "",
    landmark:     address.landmark || "",
    city:         address.city,
    state:        address.state,
    country:      address.country || "India",
    postalCode:   address.postalCode,
    addressType:  address.type || "Home"
});

/**
 * Builds a coupon snapshot object from a validation result.
 *
 * @param {Object|null} couponResult - Result from couponService.validateCoupon.
 * @returns {Object} Coupon snapshot.
 */
const buildCouponSnapshot = (couponResult) => {
    if (!couponResult || !couponResult.coupon) {
        return {
            code: "",
            discountType: "",
            discountValue: 0,
            discountApplied: 0
        };
    }

    return {
        code:            couponResult.coupon.code,
        discountType:    couponResult.coupon.discountType,
        discountValue:   couponResult.coupon.discountValue,
        discountApplied: couponResult.discountAmount
    };
};

/**
 * Calculates complete pricing breakdown.
 *
 * @param {number} subtotal       - Sum of line item subtotals.
 * @param {number} discountAmount - Discount from coupon.
 * @param {number} shippingFee    - Shipping charge (default ₹0 for v1).
 * @param {number} tax            - Tax / GST (default ₹0 for v1).
 * @returns {Object} Pricing snapshot.
 */
const calculatePricing = (subtotal, discountAmount = 0, shippingFee = 0, tax = 0) => {
    const total = Math.max(0, Math.round((subtotal - discountAmount + shippingFee + tax) * 100) / 100);
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discountAmount * 100) / 100,
        shippingFee,
        tax,
        total
    };
};

/**
 * Generates a unique, human-readable order number.
 * Format: ORD-YYYYMMDD-XXXXXX (e.g. ORD-20260724-582914)
 *
 * @returns {string} Order number string.
 */
const generateOrderNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.floor(100000 + Math.random() * 900000).toString();
    return `ORD-${dateStr}-${randomStr}`;
};

/**
 * Reduces variant stock in Product collection for ordered items.
 *
 * @param {Array} orderItems - Order line items.
 * @param {Object} [session] - Optional Mongoose ClientSession for transactions.
 */
const reduceStock = async (orderItems, session = null) => {
    for (const item of orderItems) {
        const options = session ? { session } : {};
        await Product.updateOne(
            {
                _id: item.product,
                "variants.color.name": new RegExp(`^${item.color.name}$`, "i")
            },
            {
                $inc: { "variants.$[v].sizes.$[s].stock": -item.quantity }
            },
            {
                arrayFilters: [
                    { "v.color.name": new RegExp(`^${item.color.name}$`, "i") },
                    { "s.size": item.size }
                ],
                ...options
            }
        );
    }
};

/**
 * Restores variant stock in Product collection for cancelled orders.
 *
 * @param {Array} orderItems - Order line items.
 * @param {Object} [session] - Optional Mongoose ClientSession for transactions.
 */
const restoreStock = async (orderItems, session = null) => {
    for (const item of orderItems) {
        const options = session ? { session } : {};
        await Product.updateOne(
            {
                _id: item.product,
                "variants.color.name": new RegExp(`^${item.color.name}$`, "i")
            },
            {
                $inc: { "variants.$[v].sizes.$[s].stock": item.quantity }
            },
            {
                arrayFilters: [
                    { "v.color.name": new RegExp(`^${item.color.name}$`, "i") },
                    { "s.size": item.size }
                ],
                ...options
            }
        );
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Order Service
// ─────────────────────────────────────────────────────────────────────────────

// ─── createOrder ──────────────────────────────────────────────────────────────
/**
 * Orchestrates complete order placement with ACID transaction & orderNumber collision retry logic.
 *
 * Execution Steps:
 *   1. Fetch user's cart (must exist & have items)
 *   2. Fetch user's address (must exist & belong to user)
 *   3. Validate all cart items (product active, variant exists, stock available)
 *   4. Calculate line item subtotals and cart subtotal
 *   5. Validate coupon (if provided) & calculate discount
 *   6. Build snapshots (items, shippingAddress, pricing, coupon)
 *   7. Generate order number & estimated delivery
 *   8. Create order document, reduce inventory, increment coupon usage, clear cart (all inside transaction)
 *
 * @param {string} userId - Customer ObjectId.
 * @param {Object} data   - { addressId, paymentMethod, couponCode, customerNote }
 * @returns {Promise<Order>} Placed order document.
 */
const createOrder = async (userId, data) => {
    const { addressId, paymentMethod, couponCode, customerNote } = data;

    // ── 1. Fetch Cart ──────────────────────────────────────────────────────────
    const cart = await getCartOrThrow(userId);

    // ── 2. Fetch Address ───────────────────────────────────────────────────────
    const address = await getAddressOrThrow(userId, addressId);

    // ── 3. Validate Cart ───────────────────────────────────────────────────────
    validateCart(cart);

    // ── 4. Build Order Items & Subtotal ───────────────────────────────────────
    const items = buildOrderItems(cart.items);
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    // ── 5. Validate Coupon (optional) ─────────────────────────────────────────
    let couponResult = null;
    if (couponCode) {
        couponResult = await couponService.validateCoupon(couponCode, subtotal, userId);
    }

    // ── 6. Build Snapshots & Pricing ──────────────────────────────────────────
    const pricing          = calculatePricing(subtotal, couponResult?.discountAmount || 0);
    const shippingAddress  = buildAddressSnapshot(address);
    const couponSnapshot   = buildCouponSnapshot(couponResult);

    // Derive gateway from paymentMethod (e.g. COD → Cash, online → Razorpay)
    const gateway = paymentMethod === "COD" ? "Cash" : "Razorpay";

    // Auto-calculate estimated delivery date (now + 5 days)
    const estimatedDelivery = new Date(
        Date.now() + ESTIMATED_DELIVERY_DAYS * 24 * 60 * 60 * 1000
    );

    // ── 7. Execute Order Creation & State Mutations ──────────────────────────
    // Includes collision retry loop for E11000 duplicate key error on orderNumber
    let order;
    let attempt = 0;

    while (attempt < MAX_ORDER_CREATE_RETRIES) {
        attempt++;
        const orderNumber = generateOrderNumber();

        const session = await mongoose.startSession().catch(() => null);

        try {
            if (session) session.startTransaction();

            const opts = session ? { session } : {};

            // 7a. Save order
            const [createdOrder] = await Order.create(
                [
                    {
                        orderNumber,
                        user: userId,
                        items,
                        shippingAddress,
                        pricing,
                        payment: {
                            gateway,
                            method: paymentMethod,
                            status: "Pending"
                        },
                        orderStatus: "Pending",
                        coupon: couponSnapshot,
                        statusHistory: [
                            {
                                status: "Pending",
                                changedAt: new Date(),
                                changedBy: "customer"
                            }
                        ],
                        customerNote: customerNote || "",
                        estimatedDelivery
                    }
                ],
                opts
            );

            order = createdOrder;

            // 7b. Reduce inventory stock (uses session)
            await reduceStock(items, session);

            // 7c. Increment coupon usage count (uses session)
            if (couponSnapshot.code) {
                await couponService.incrementUsage(couponSnapshot.code, session);
            }

            // 7d. Clear user cart (uses session)
            await cartService.clearCart(userId, session);

            if (session) await session.commitTransaction();

            // Success — break out of retry loop
            break;
        } catch (error) {
            if (session) await session.abortTransaction();

            // Catch duplicate orderNumber collision (E11000) and retry
            if (error.code === 11000 && error.keyPattern?.orderNumber && attempt < MAX_ORDER_CREATE_RETRIES) {
                continue;
            }

            throw error;
        } finally {
            if (session) session.endSession();
    }

    // Trigger non-blocking Order Placed email notification
    if (order) {
        Order.findById(order._id)
            .populate({ path: "user", select: "fullName name email" })
            .lean()
            .then((populatedOrder) => {
                if (populatedOrder) {
                    notificationService
                        .sendOrderPlacedNotification(
                            populatedOrder.user || { email: populatedOrder.shippingAddress?.email },
                            populatedOrder
                        )
                        .catch((err) => console.error("[OrderService] Failed to send order confirmation email:", err?.message || err));
                }
            })
            .catch((err) => console.error("[OrderService] Notification user lookup error:", err?.message || err));
    }

    return order;
};

// ─── getOrders ────────────────────────────────────────────────────────────────
/**
 * Returns a paginated list of orders.
 * Admin sees all orders (with optional status filter & search). User details are populated ONLY for admin.
 * Customer sees only their own orders (no unnecessary user populate join).
 *
 * @param {string} userId   - Authenticated user's ObjectId.
 * @param {string} userRole - User role ("admin" | "customer").
 * @param {Object} query    - Query params ({ page, limit, status, search }).
 * @returns {Promise<{ orders, total, page, totalPages }>}
 */
const getOrders = async (userId, userRole, query = {}) => {
    const {
        page   = 1,
        limit  = 10,
        status,
        search
    } = query;

    const filter = {};

    // Customer scoping: customers only see their own orders
    if (userRole !== "admin") {
        filter.user = userId;
    }

    if (status) {
        filter.orderStatus = status;
    }

    // Escape regex metacharacters to prevent ReDoS / unintended match pattern
    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.orderNumber = { $regex: escaped, $options: "i" };
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    let queryBuilder = Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    // Populate user ONLY for admin queries — customers already know their own identity
    if (userRole === "admin") {
        queryBuilder = queryBuilder.populate({
            path: "user",
            select: "fullName email phone"
        });
    }

    const [orders, total] = await Promise.all([
        queryBuilder.lean(),
        Order.countDocuments(filter)
    ]);

    return {
        orders,
        total,
        page:       pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
};

// ─── getOrderById ─────────────────────────────────────────────────────────────
/**
 * Returns a single order by ID.
 * Customer can only access their own order; Admin can access any order.
 *
 * @param {string} orderId  - Order ObjectId string.
 * @param {string} userId   - Authenticated user's ObjectId.
 * @param {string} userRole - User role ("admin" | "customer").
 * @returns {Promise<Order>} Order document.
 * @throws {ApiError} 404 | 403
 */
const getOrderById = async (orderId, userId, userRole) => {
    let queryBuilder = Order.findById(orderId);

    if (userRole === "admin") {
        queryBuilder = queryBuilder.populate({ path: "user", select: "fullName email phone" });
    }

    const order = await queryBuilder.lean();

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const ownerId = typeof order.user === "object" ? order.user._id : order.user;
    if (userRole !== "admin" && ownerId.toString() !== userId.toString()) {
        throw new ApiError(403, "You do not have permission to view this order");
    }

    return order;
};

// ─── updateOrderStatus ────────────────────────────────────────────────────────
/**
 * Admin method to transition order status.
 * Enforces valid state machine transitions (e.g. Pending → Confirmed → Packed).
 * Automatically updates delivery timestamps and appends status history.
 * If status is changed to Cancelled, stock is restored.
 *
 * @param {string} orderId     - Order ObjectId string.
 * @param {string} newStatus   - Target status from ORDER_STATUSES.
 * @param {string} [adminNote] - Optional admin note.
 * @param {string} adminUserId - Admin user ID for audit log.
 * @returns {Promise<Order>} Updated order document.
 * @throws {ApiError} 404 | 400
 */
const updateOrderStatus = async (orderId, newStatus, adminNote = "", adminUserId = "admin") => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const currentStatus = order.orderStatus;

    if (currentStatus === newStatus) {
        throw new ApiError(400, `Order is already in "${newStatus}" status`);
    }

    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
        throw new ApiError(
            400,
            `Cannot transition order status from "${currentStatus}" to "${newStatus}". ` +
            `Allowed next states: ${allowed.join(", ") || "None (terminal state)"}`
        );
    }

    order.orderStatus = newStatus;
    order.statusHistory.push({
        status: newStatus,
        changedAt: new Date(),
        changedBy: adminUserId
    });

    if (adminNote) {
        order.adminNote = adminNote;
    }

    if (newStatus === "Delivered") {
        order.deliveredAt = new Date();
        order.payment.status = "Paid";
    } else if (newStatus === "Cancelled") {
        order.cancelledAt = new Date();
        await restoreStock(order.items);
    }

    await order.save();

    // Trigger non-blocking status notifications
    if (newStatus === "Shipped" || newStatus === "Delivered") {
        Order.findById(order._id)
            .populate({ path: "user", select: "fullName name email" })
            .lean()
            .then((populatedOrder) => {
                if (!populatedOrder) return;
                const userObj = populatedOrder.user || { email: populatedOrder.shippingAddress?.email };

                if (newStatus === "Shipped") {
                    notificationService
                        .sendOrderShippedNotification(userObj, populatedOrder, {
                            carrier: "Standard Express",
                            trackingNumber: populatedOrder.trackingNumber || "N/A"
                        })
                        .catch((err) => console.error("[OrderService] Failed to send order shipped email:", err?.message || err));
                } else if (newStatus === "Delivered") {
                    notificationService
                        .sendOrderDeliveredNotification(userObj, populatedOrder)
                        .catch((err) => console.error("[OrderService] Failed to send order delivered email:", err?.message || err));
                }
            })
            .catch((err) => console.error("[OrderService] Status notification user lookup error:", err?.message || err));
    }

    return order;
};

// ─── cancelOrder ──────────────────────────────────────────────────────────────
/**
 * Customer / Admin cancellation method.
 * Only orders in "Pending" or "Confirmed" status can be cancelled.
 * Restores product inventory upon cancellation.
 *
 * @param {string} orderId  - Order ObjectId string.
 * @param {string} userId   - Authenticated user's ObjectId.
 * @param {string} userRole - User role ("admin" | "customer").
 * @param {string} [reason] - Optional cancellation reason.
 * @returns {Promise<Order>} Updated order document.
 * @throws {ApiError} 404 | 403 | 400
 */
const cancelOrder = async (orderId, userId, userRole, reason = "") => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (userRole !== "admin" && order.user.toString() !== userId.toString()) {
        throw new ApiError(403, "You do not have permission to cancel this order");
    }

    const cancellableStatuses = ["Pending", "Confirmed"];
    if (!cancellableStatuses.includes(order.orderStatus)) {
        throw new ApiError(
            400,
            `Order cannot be cancelled because it is currently "${order.orderStatus}". ` +
            `Only orders in "Pending" or "Confirmed" status can be cancelled.`
        );
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = new Date();
    order.statusHistory.push({
        status: "Cancelled",
        changedAt: new Date(),
        changedBy: userRole === "admin" ? `admin:${userId}` : "customer"
    });

    if (reason) {
        order.customerNote = order.customerNote
            ? `${order.customerNote} | Cancellation reason: ${reason}`
            : `Cancellation reason: ${reason}`;
    }

    await restoreStock(order.items);
    await order.save();

    return order;
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};
