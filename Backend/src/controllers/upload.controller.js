const asyncHandler = require("../utils/asyncHandler");
const ApiResponse  = require("../utils/ApiResponse");
const ApiError    = require("../utils/ApiError");
const imageService = require("../services/image.service");

// ─────────────────────────────────────────────────────────────────────────────
// Upload Controller
// ─────────────────────────────────────────────────────────────────────────────

// ─── Upload Single Image ──────────────────────────────────────────────────────
// POST /api/v1/upload/single
const uploadSingleImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Please select an image file to upload");
    }

    const folder = req.body.folder || "/products";
    const result = await imageService.uploadImage(req.file, folder);

    return res
        .status(201)
        .json(new ApiResponse(201, result, "Image uploaded successfully"));
});

// ─── Upload Multiple Images ───────────────────────────────────────────────────
// POST /api/v1/upload/multiple
const uploadMultipleImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "Please select image files to upload");
    }

    const folder = req.body.folder || "/products";
    const results = await imageService.uploadMultipleImages(req.files, folder);

    return res
        .status(201)
        .json(new ApiResponse(201, results, `${results.length} images uploaded successfully`));
});

// ─── Delete Image ─────────────────────────────────────────────────────────────
// DELETE /api/v1/upload/:fileId
const deleteImage = asyncHandler(async (req, res) => {
    const { fileId } = req.params;

    const result = await imageService.deleteImage(fileId);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Image deleted successfully from ImageKit"));
});

// ─── Get Image Details ────────────────────────────────────────────────────────
// GET /api/v1/upload/details/:fileId
const getImageDetails = asyncHandler(async (req, res) => {
    const { fileId } = req.params;

    const details = await imageService.getImageDetails(fileId);

    return res
        .status(200)
        .json(new ApiResponse(200, details, "Image details fetched successfully"));
});

// ─── Generate Dynamic Transformed URL ─────────────────────────────────────────
// POST /api/v1/upload/transform
const getOptimizedUrl = asyncHandler(async (req, res) => {
    const { url, width, height, quality, format, crop } = req.body;

    if (!url) {
        throw new ApiError(400, "Image URL is required");
    }

    const optimizedUrl = imageService.generateOptimizedUrl(url, {
        width,
        height,
        quality,
        format,
        crop
    });

    const thumbnailUrl = imageService.generateThumbnail(url);

    return res
        .status(200)
        .json(new ApiResponse(200, { optimizedUrl, thumbnailUrl }, "Transformed URLs generated successfully"));
});

module.exports = {
    uploadSingleImage,
    uploadMultipleImages,
    deleteImage,
    getImageDetails,
    getOptimizedUrl
};
