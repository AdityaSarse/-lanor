const express = require("express");
const router  = express.Router();

const wishlistController = require("../controllers/wishlist.controller");

const validate      = require("../middelwares/validation.middleware");
const { verifyJWT } = require("../middelwares/auth.middleware");

const { productIdValidator } = require("../validators/wishlist.validator");

// ─────────────────────────────────────────────────────────────────────────────
// All Wishlist Routes Are Protected
// Every route requires verifyJWT — the wishlist is personal to each user.
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/v1/wishlist
// Returns the logged-in user's wishlist, paginated.
// Stale (soft-deleted / inactive) products are filtered out of the response.
router.get("/", verifyJWT, wishlistController.getWishlist);

// NOTE: Static route DELETE / (clearWishlist) must be defined BEFORE /:productId
//       so Express does not try to validate "" as a MongoId param.

// DELETE /api/v1/wishlist  — clears the entire wishlist
router.delete("/", verifyJWT, wishlistController.clearWishlist);

// POST   /api/v1/wishlist/:productId  — add a product
router.post(
    "/:productId",
    verifyJWT,
    productIdValidator,
    validate,
    wishlistController.addToWishlist
);

// DELETE /api/v1/wishlist/:productId  — remove a single product
router.delete(
    "/:productId",
    verifyJWT,
    productIdValidator,
    validate,
    wishlistController.removeFromWishlist
);

module.exports = router;
