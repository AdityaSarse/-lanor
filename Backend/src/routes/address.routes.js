const express = require("express");
const router = express.Router();

const addressController = require("../controllers/address.controller");

const validate = require("../middelwares/validation.middleware");
const { verifyJWT } = require("../middelwares/auth.middleware");

const {
    createAddressValidator,
    updateAddressValidator,
    addressIdValidator
} = require("../validators/address.validator");

// ─────────────────────────────────────────────────────────────────────────────
// All Address Routes Are Protected
// Every address belongs to the logged-in user — verifyJWT on every route.
// ─────────────────────────────────────────────────────────────────────────────
router.use(verifyJWT);

// POST  /api/ v1/address  — create a new address
// Auto-sets default if this is the user's first address.
router.post(
    "/",
    createAddressValidator,
    validate,
    addressController.createAddress
);

// GET   /api/v1/address  — list all addresses (default first)
router.get("/", addressController.getAddresses);

// NOTE: Static nested path /:id/default must be registered BEFORE /:id
//       to prevent Express from treating "default" as the :id param.

// PATCH /api/v1/address/:id/default  — set as default (no body required)
router.patch(
    "/:id/default",
    addressIdValidator,
    validate,
    addressController.setDefaultAddress
);

// GET   /api/v1/address/:id  — get a single address (ownership enforced)
router.get(
    "/:id",
    addressIdValidator,
    validate,
    addressController.getAddressById
);

// PATCH /api/v1/address/:id  — update fields (all optional)
router.patch(
    "/:id",
    updateAddressValidator,
    validate,
    addressController.updateAddress
);

// DELETE /api/v1/address/:id  — delete; auto-promotes next default if needed
router.delete(
    "/:id",
    addressIdValidator,
    validate,
    addressController.deleteAddress
);

module.exports = router;
