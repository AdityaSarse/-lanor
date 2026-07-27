const express = require("express");
const router  = express.Router();

const uploadController = require("../controllers/upload.controller");
const { uploadSingle, uploadMultiple } = require("../middelwares/upload.middleware");
const { verifyJWT, verifyRole } = require("../middelwares/auth.middleware");

// ─────────────────────────────────────────────────────────────────────────────
// Upload Routes (/api/v1/upload)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Protected Admin Upload Routes ────────────────────────────────────────────

// POST /api/v1/upload/single — Upload a single image file
router.post(
    "/single",
    verifyJWT,
    verifyRole("admin"),
    uploadSingle,
    uploadController.uploadSingleImage
);

// POST /api/v1/upload/multiple — Upload multiple image files (up to 10)
router.post(
    "/multiple",
    verifyJWT,
    verifyRole("admin"),
    uploadMultiple,
    uploadController.uploadMultipleImages
);

// DELETE /api/v1/upload/:fileId — Delete an image from ImageKit by fileId
router.delete(
    "/:fileId",
    verifyJWT,
    verifyRole("admin"),
    uploadController.deleteImage
);

// GET /api/v1/upload/details/:fileId — Get image details from ImageKit
router.get(
    "/details/:fileId",
    verifyJWT,
    verifyRole("admin"),
    uploadController.getImageDetails
);

// POST /api/v1/upload/transform — Generate optimized / transformed URLs
router.post(
    "/transform",
    verifyJWT,
    uploadController.getOptimizedUrl
);

module.exports = router;
