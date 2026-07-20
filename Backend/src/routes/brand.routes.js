const express = require("express");
const router  = express.Router();

const brandController = require("../controllers/brand.controller");

const validate              = require("../middelwares/validation.middleware");
const { verifyJWT, verifyRole } = require("../middelwares/auth.middleware");

const {
    createBrandValidator,
    updateBrandValidator,
    brandIdValidator
} = require("../validators/brand.validator");

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes — no authentication required
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/brands
router.get("/", brandController.getAllBrands);

// NOTE: Static paths must come BEFORE /:id to prevent Express from treating
//       "featured" or "slug" as the :id param.

// GET /api/v1/brands/featured
router.get("/featured", brandController.getFeaturedBrands);

// GET /api/v1/brands/slug/:slug
router.get("/slug/:slug", brandController.getBrandBySlug);

// GET /api/v1/brands/:id
router.get(
    "/:id",
    brandIdValidator,
    validate,
    brandController.getBrandById
);

// ─────────────────────────────────────────────────────────────────────────────
// Protected Admin Routes — verifyJWT + verifyRole("admin") required
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/brands
router.post(
    "/",
    verifyJWT,
    verifyRole("admin"),
    createBrandValidator,
    validate,
    brandController.createBrand
);

// PATCH /api/v1/brands/:id
router.patch(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    brandIdValidator,
    updateBrandValidator,
    validate,
    brandController.updateBrand
);

// DELETE /api/v1/brands/:id
router.delete(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    brandIdValidator,
    validate,
    brandController.deleteBrand
);

module.exports = router;
