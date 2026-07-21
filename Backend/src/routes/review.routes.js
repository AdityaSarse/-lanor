const express = require("express");
const router  = express.Router();

const reviewController = require("../controllers/review.controller");

const validate              = require("../middelwares/validation.middleware");
const { verifyJWT, verifyRole } = require("../middelwares/auth.middleware");

const {
    createReviewValidator,
    updateReviewValidator,
    reviewIdValidator,
    productIdParamValidator
} = require("../validators/review.validator");

// ─────────────────────────────────────────────────────────────────────────────
// Public Routes — no authentication required
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: Static named paths (/product/:productId, /admin) must come BEFORE /:id
//       to prevent Express from treating "product" or "admin" as the :id param.

// GET /api/v1/reviews/product/:productId
// Returns paginated reviews for a specific product.
// Validates product exists → throws 404 if not.
router.get(
    "/product/:productId",
    productIdParamValidator,
    validate,
    reviewController.getProductReviews
);

// GET /api/v1/reviews/:id
router.get(
    "/:id",
    reviewIdValidator,
    validate,
    reviewController.getReviewById
);

// ─────────────────────────────────────────────────────────────────────────────
// Admin Route — moderation dashboard
// GET /api/v1/reviews/admin
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: /admin must be defined BEFORE /:id to avoid being matched as an id param.
// Re-declaring here with a separate use() block ensures ordering is unambiguous.
// We define it above /:id in source order as well.
router.get(
    "/admin",
    verifyJWT,
    verifyRole("admin"),
    reviewController.getAllReviews
);

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes — any logged-in user
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/reviews
// Enforces: delivered order → product in order → no duplicate review
router.post(
    "/",
    verifyJWT,
    createReviewValidator,
    validate,
    reviewController.createReview
);

// PATCH /api/v1/reviews/:id
// Owner or admin — service layer handles the authorisation check
router.patch(
    "/:id",
    verifyJWT,
    reviewIdValidator,
    updateReviewValidator,
    validate,
    reviewController.updateReview
);

// DELETE /api/v1/reviews/:id
// Owner or admin — service layer handles the authorisation check
router.delete(
    "/:id",
    verifyJWT,
    reviewIdValidator,
    validate,
    reviewController.deleteReview
);

module.exports = router;
