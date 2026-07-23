const asyncHandler   = require("../utils/asyncHandler");
const ApiResponse    = require("../utils/ApiResponse");
const couponService  = require("../services/coupon.service");

// ─────────────────────────────────────────────────────────────────────────────
// Create Coupon (Admin)
// POST /api/v1/coupons
// ─────────────────────────────────────────────────────────────────────────────
const createCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.createCoupon(req.body);

    return res
        .status(201)
        .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Get All Coupons (Admin)
// GET /api/v1/coupons
// ─────────────────────────────────────────────────────────────────────────────
const getCoupons = asyncHandler(async (req, res) => {
    const { coupons, total, page, totalPages } =
        await couponService.getCoupons(req.query);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                coupons,
                "Coupons fetched successfully",
                { total, page, totalPages }
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// Get Coupon By Id (Admin)
// GET /api/v1/coupons/:id
// ─────────────────────────────────────────────────────────────────────────────
const getCouponById = asyncHandler(async (req, res) => {
    const coupon = await couponService.getCouponById(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, coupon, "Coupon fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Update Coupon (Admin)
// PATCH /api/v1/coupons/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);

    return res
        .status(200)
        .json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Delete Coupon (Admin)
// DELETE /api/v1/coupons/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteCoupon = asyncHandler(async (req, res) => {
    await couponService.deleteCoupon(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Coupon deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// Validate Coupon (Customer)
// POST /api/v1/coupons/validate
// ─────────────────────────────────────────────────────────────────────────────
const validateCoupon = asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;

    const result = await couponService.validateCoupon(
        code,
        subtotal,
        req.user._id
    );

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Coupon validated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    createCoupon,
    getCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon
};
