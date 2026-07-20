const express = require("express");
const router  = express.Router();

const categoryController = require("../controllers/category.controller");

const {
    createCategoryValidator,
    updateCategoryValidator,
    categoryIdValidator
} = require("../validators/category.validator");

const validate              = require("../middelwares/validation.middleware");
const { verifyJWT, verifyRole } = require("../middelwares/auth.middleware");

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes — no authentication required
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/categories
router.get("/", categoryController.getAllCategories);

// NOTE: Static named paths must come BEFORE /:id to prevent Express from
//       consuming "tree", "featured", or "slug" as the :id param.

// GET /api/v1/categories/tree
router.get("/tree", categoryController.getCategoryTree);

// GET /api/v1/categories/featured
router.get("/featured", categoryController.getFeaturedCategories);

// GET /api/v1/categories/slug/:slug
router.get("/slug/:slug", categoryController.getCategoryBySlug);

// GET /api/v1/categories/:id
router.get(
    "/:id",
    categoryIdValidator,
    validate,
    categoryController.getCategoryById
);

// ─────────────────────────────────────────────────────────────────────────────
// Protected Admin Routes — verifyJWT + verifyRole("admin") required
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/categories
router.post(
    "/",
    verifyJWT,
    verifyRole("admin"),
    createCategoryValidator,
    validate,
    categoryController.createCategory
);

// PATCH /api/v1/categories/:id
router.patch(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    categoryIdValidator,
    updateCategoryValidator,
    validate,
    categoryController.updateCategory
);

// DELETE /api/v1/categories/:id
router.delete(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    categoryIdValidator,
    validate,
    categoryController.deleteCategory
);

module.exports = router;
