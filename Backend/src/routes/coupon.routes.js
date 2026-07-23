const express = require("express");
const router  = express.Router();

const couponController = require("../controllers/coupon.controller");

const validate              = require("../middelwares/validation.middleware");
const { verifyJWT, verifyRole } = require("../middelwares/auth.middleware");

const {
    createCouponValidator,
    updateCouponValidator,
    couponIdValidator,
    validateCouponValidator
} = require("../validators/coupon.validator");

// ─────────────────────────────────────────────────────────────────────────────
// Customer Routes (Protected)
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: Static routes like /validate MUST be registered before parameterized
// routes like /:id to prevent Express from treating "validate" as an :id param.

// POST /api/v1/coupons/validate — Validate coupon code and calculate discount at checkout
router.post(
    "/validate",
    verifyJWT,
    validateCouponValidator,
    validate,
    couponController.validateCoupon
);

// ─────────────────────────────────────────────────────────────────────────────
// Protected Admin Routes — verifyJWT + verifyRole("admin") required
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/coupons — Create a new coupon
router.post(
    "/",
    verifyJWT,
    verifyRole("admin"),
    createCouponValidator,
    validate,
    couponController.createCoupon
);

// GET /api/v1/coupons — Get paginated, filterable list of coupons
router.get(
    "/",
    verifyJWT,
    verifyRole("admin"),
    couponController.getCoupons
);

// GET /api/v1/coupons/:id — Get a single coupon by ID
router.get(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    couponIdValidator,
    validate,
    couponController.getCouponById
);

// PATCH /api/v1/coupons/:id — Partially update a coupon
router.patch(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    updateCouponValidator,
    validate,
    couponController.updateCoupon
);

// DELETE /api/v1/coupons/:id — Soft-delete a coupon
router.delete(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    couponIdValidator,
    validate,
    couponController.deleteCoupon
);

module.exports = router;
