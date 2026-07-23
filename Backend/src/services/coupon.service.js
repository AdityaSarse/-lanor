const Coupon = require("../models/coupon.model");
const Order  = require("../models/order.model");
const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Base filter that excludes soft-deleted coupons. */
const ALIVE = { deletedAt: null };

/**
 * Order statuses that do NOT count toward coupon usage.
 * A cancelled or refunded order should free up the usage slot.
 */
const NON_COUNTING_STATUSES = ["Cancelled", "Refunded"];

// ─────────────────────────────────────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches a coupon by code (uppercase) that is not soft-deleted.
 * Throws 404 if it doesn't exist.
 *
 * @param {string} code - Coupon code (already uppercased by validator).
 * @returns {Promise<Coupon>}
 * @throws {ApiError} 404
 */
const findCouponByCode = async (code) => {
    const coupon = await Coupon.findOne({ code, ...ALIVE });
    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }
    return coupon;
};

/**
 * Counts how many non-cancelled/refunded orders a specific user has placed
 * using the given coupon code.
 * Used to enforce `usagePerUser`.
 *
 * @param {string} userId   - The customer's ObjectId.
 * @param {string} code     - Coupon code (uppercase).
 * @returns {Promise<number>}
 */
const countUserUsage = (userId, code) =>
    Order.countDocuments({
        user: userId,
        "coupon.couponCode": code,
        orderStatus: { $nin: NON_COUNTING_STATUSES }
    });

/**
 * Calculates the final discount amount, honouring `maximumDiscount`.
 *
 * Rules:
 *   Percentage → (subtotal × discountValue / 100), capped at maximumDiscount if set.
 *   Fixed      → discountValue, but never more than the subtotal itself.
 *
 * The returned discount is rounded to 2 decimal places to avoid float drift
 * in financial calculations (e.g. 15.999999 → 16.00).
 *
 * @param {Coupon} coupon   - Mongoose Coupon document.
 * @param {number} subtotal - Cart subtotal in ₹.
 * @returns {number} discountAmount
 */
const calculateDiscount = (coupon, subtotal) => {
    let discount;

    if (coupon.discountType === "Percentage") {
        discount = (subtotal * coupon.discountValue) / 100;

        // Cap at maximumDiscount if one is set (0 = no cap)
        if (coupon.maximumDiscount > 0 && discount > coupon.maximumDiscount) {
            discount = coupon.maximumDiscount;
        }
    } else {
        // Fixed — never give more discount than the cart is worth
        discount = Math.min(coupon.discountValue, subtotal);
    }

    return Math.round(discount * 100) / 100;
};

// ─────────────────────────────────────────────────────────────────────────────
// Coupon Service
// ─────────────────────────────────────────────────────────────────────────────

// ─── createCoupon ─────────────────────────────────────────────────────────────
/**
 * Creates a new coupon after verifying the code is unique.
 *
 * @param {Object} data - Validated fields from the controller.
 * @returns {Promise<Coupon>}
 * @throws {ApiError} 409 if the coupon code is already taken.
 */
const createCoupon = async (data) => {
    const codeTaken = await Coupon.exists({ code: data.code });
    if (codeTaken) {
        throw new ApiError(409, `Coupon code "${data.code}" already exists`);
    }

    return Coupon.create(data);
};

// ─── getCoupons ───────────────────────────────────────────────────────────────
/**
 * Returns a paginated, filterable list of coupons (admin view).
 *
 * Supported filters: page, limit, search (code prefix), isActive, sort.
 *
 * @param {Object} filters - Parsed query params from the controller.
 * @returns {Promise<{ coupons, total, page, totalPages }>}
 */
const getCoupons = async (filters = {}) => {
    const {
        page     = 1,
        limit    = 20,
        search,
        isActive,
        sort     = "-createdAt"
    } = filters;

    const query = { ...ALIVE };

    // Prefix search on code — efficient because code has an index
    if (search) {
        query.code = { $regex: `^${search.toUpperCase()}` };
    }

    // isActive comes in as a query-string, so coerce it
    if (isActive !== undefined) {
        query.isActive = isActive === "true" || isActive === true;
    }

    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const allowedSorts = new Set([
        "code",        "-code",
        "createdAt",   "-createdAt",
        "validFrom",   "-validFrom",
        "validUntil",  "-validUntil"
    ]);
    const sortField = allowedSorts.has(sort) ? sort : "-createdAt";

    const [coupons, total] = await Promise.all([
        Coupon.find(query)
            .sort(sortField)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Coupon.countDocuments(query)
    ]);

    return {
        coupons,
        total,
        page:       pageNum,
        totalPages: Math.ceil(total / limitNum)
    };
};

// ─── getCouponById ────────────────────────────────────────────────────────────
/**
 * Returns a single coupon by its MongoDB ObjectId.
 *
 * @param {string} id - MongoDB ObjectId string.
 * @returns {Promise<Coupon>}
 * @throws {ApiError} 404 if not found or soft-deleted.
 */
const getCouponById = async (id) => {
    const coupon = await Coupon.findOne({ _id: id, ...ALIVE }).lean();
    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }
    return coupon;
};

// ─── updateCoupon ─────────────────────────────────────────────────────────────
/**
 * Partially updates a coupon.
 * Re-validates code uniqueness only when the code is actually changing.
 *
 * @param {string} id   - MongoDB ObjectId of the coupon to update.
 * @param {Object} data - Validated partial fields from the controller.
 * @returns {Promise<Coupon>}
 * @throws {ApiError} 404 not found | 409 code conflict.
 */
const updateCoupon = async (id, data) => {
    const coupon = await Coupon.findOne({ _id: id, ...ALIVE });
    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    // Only check uniqueness if the code is actually changing
    if (data.code && data.code !== coupon.code) {
        const codeTaken = await Coupon.exists({ code: data.code, _id: { $ne: id } });
        if (codeTaken) {
            throw new ApiError(409, `Coupon code "${data.code}" already exists`);
        }
    }

    Object.assign(coupon, data);
    await coupon.save();

    return coupon;
};

// ─── deleteCoupon ─────────────────────────────────────────────────────────────
/**
 * Soft-deletes a coupon by stamping `deletedAt`.
 * Preserves promotion history — never hard-delete a coupon.
 *
 * @param {string} id - MongoDB ObjectId string.
 * @returns {Promise<void>}
 * @throws {ApiError} 404 if not found or already deleted.
 */
const deleteCoupon = async (id) => {
    const coupon = await Coupon.findOne({ _id: id, ...ALIVE });
    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    coupon.deletedAt = new Date();
    await coupon.save();
};

// ─── validateCoupon ───────────────────────────────────────────────────────────
/**
 * The core business-logic check run at checkout.
 *
 * Checks (in order):
 *   1. Coupon exists and is not soft-deleted.
 *   2. Coupon is active (isActive flag).
 *   3. Current date is within the validity window (validFrom → validUntil).
 *   4. Global usage limit has not been reached (usageLimit; 0 = unlimited).
 *   5. This specific user has not exceeded their personal limit (usagePerUser).
 *   6. Cart subtotal meets the minimumOrder requirement.
 *   7. Discount is calculated and capped by maximumDiscount.
 *
 * @param {string} code     - Coupon code (already uppercased by validator).
 * @param {number} subtotal - Cart subtotal in ₹ (from client or fetched from cart).
 * @param {string} userId   - The authenticated customer's ObjectId.
 * @returns {Promise<{
 *   coupon:       Coupon,
 *   discountAmount: number,
 *   payable:      number
 * }>}
 * @throws {ApiError} 404 | 400 for any failed check.
 */
const validateCoupon = async (code, subtotal, userId) => {
    // ── 1. Exists and not soft-deleted ────────────────────────────────────────
    const coupon = await findCouponByCode(code);

    // ── 2. Active flag ────────────────────────────────────────────────────────
    if (!coupon.isActive) {
        throw new ApiError(400, "This coupon is currently inactive");
    }

    // ── 3. Validity window ────────────────────────────────────────────────────
    const now = new Date();
    if (now < coupon.validFrom) {
        throw new ApiError(400, "This coupon is not yet active");
    }
    if (now > coupon.validUntil) {
        throw new ApiError(400, "This coupon has expired");
    }

    // ── 4. Global usage limit ─────────────────────────────────────────────────
    // usageLimit === 0 means unlimited
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        throw new ApiError(400, "This coupon has reached its usage limit");
    }

    // ── 5. Per-user usage limit ───────────────────────────────────────────────
    const userUsage = await countUserUsage(userId, code);
    if (userUsage >= coupon.usagePerUser) {
        throw new ApiError(
            400,
            coupon.usagePerUser === 1
                ? "You have already used this coupon"
                : `You can only use this coupon ${coupon.usagePerUser} time(s)`
        );
    }

    // ── 6. Minimum order amount ───────────────────────────────────────────────
    if (subtotal < coupon.minimumOrder) {
        throw new ApiError(
            400,
            `This coupon requires a minimum order of ₹${coupon.minimumOrder}. ` +
            `Your cart total is ₹${subtotal}.`
        );
    }

    // ── 7. Calculate discount ─────────────────────────────────────────────────
    const discountAmount = calculateDiscount(coupon, subtotal);
    const payable        = Math.round((subtotal - discountAmount) * 100) / 100;

    return {
        coupon,
        discountAmount,
        payable
    };
};

// ─── incrementUsage ───────────────────────────────────────────────────────────
/**
 * Atomically increments the coupon's `usedCount` by 1.
 * Called by the Order service immediately after an order is confirmed —
 * NOT inside validateCoupon, because validation and order creation are
 * separate steps and we only want to count confirmed orders.
 *
 * Uses `$inc` for atomicity — avoids a read-modify-write race condition
 * when two users apply the same coupon simultaneously.
 *
 * @param {string} code - Coupon code (uppercase).
 * @returns {Promise<void>}
 */
const incrementUsage = async (code) => {
    await Coupon.updateOne(
        { code, ...ALIVE },
        { $inc: { usedCount: 1 } }
    );
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createCoupon,
    getCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    incrementUsage
};
