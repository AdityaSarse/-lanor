const express = require("express");
const router  = express.Router();

const productController = require("../controllers/product.controller");

const {
    createProductValidator,
    updateProductValidator,
    productIdValidator
} = require("../validators/product.validator");

const validate   = require("../middelwares/validation.middleware");
const { verifyJWT, verifyRole } = require("../middelwares/auth.middleware");

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes — no authentication required
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/products
router.get("/", productController.getAllProducts);

// GET /api/v1/products/featured
router.get("/featured", productController.getFeaturedProducts);

// GET /api/v1/products/new-arrivals
router.get("/new-arrivals", productController.getNewArrivals);

// GET /api/v1/products/top-rated
router.get("/top-rated", productController.getTopRatedProducts);

// GET /api/v1/products/search?keyword=shirt&page=1&limit=12
router.get("/search", productController.searchProducts);

// GET /api/v1/products/:id
// NOTE: /:id must come AFTER all named static paths above,
//       otherwise Express would match "featured" etc. as an id param.
router.get(
    "/:id",
    productIdValidator,
    validate,
    productController.getProductById
);

// ─────────────────────────────────────────────────────────────────────────────
// Protected Admin Routes — verifyJWT + verifyRole("admin") required
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/products
router.post(
    "/",
    verifyJWT,
    verifyRole("admin"),
    createProductValidator,
    validate,
    productController.createProduct
);

// PUT /api/v1/products/:id
router.put(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    productIdValidator,
    updateProductValidator,
    validate,
    productController.updateProduct
);

// DELETE /api/v1/products/:id
router.delete(
    "/:id",
    verifyJWT,
    verifyRole("admin"),
    productIdValidator,
    validate,
    productController.deleteProduct
);

module.exports = router;
