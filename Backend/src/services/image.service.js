const imagekit = require("../config/imagekit");
const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// Image Service (ImageKit Integration)
//
// Single source of truth for uploading, deleting, fetching, and transforming
// images via ImageKit SDK.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uploads a single file buffer to ImageKit.
 *
 * @param {Object} file         - Express Multer file object (containing .buffer, .originalname)
 * @param {string} [folder]     - Target folder in ImageKit (e.g. "/products", "/categories")
 * @returns {Promise<{ fileId: string, url: string, fileName: string, thumbnailUrl: string }>}
 */
const uploadImage = async (file, folder = "/products") => {
    if (!file || !file.buffer) {
        throw new ApiError(400, "No image file provided for upload.");
    }

    try {
        const sanitizedFileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        const uploadResponse = await imagekit.upload({
            file: file.buffer,
            fileName: sanitizedFileName,
            folder: folder,
            useUniqueFileName: true
        });

        return {
            fileId:       uploadResponse.fileId,
            url:          uploadResponse.url,
            fileName:     uploadResponse.name,
            thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url
        };
    } catch (error) {
        console.error("[ImageService] Upload error:", error);
        throw new ApiError(500, `Failed to upload image to ImageKit: ${error.message || error}`);
    }
};

/**
 * Uploads multiple file buffers to ImageKit concurrently.
 *
 * @param {Array<Object>} files - Array of Express Multer file objects
 * @param {string} [folder]     - Target folder in ImageKit
 * @returns {Promise<Array<{ fileId, url, fileName, thumbnailUrl }>>}
 */
const uploadMultipleImages = async (files = [], folder = "/products") => {
    if (!files || files.length === 0) {
        throw new ApiError(400, "No image files provided for batch upload.");
    }

    try {
        const uploadPromises = files.map((file) => uploadImage(file, folder));
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error("[ImageService] Batch upload error:", error);
        throw new ApiError(500, `Failed to upload multiple images: ${error.message || error}`);
    }
};

/**
 * Deletes an image from ImageKit by fileId.
 *
 * @param {string} fileId - ImageKit fileId string
 * @returns {Promise<{ success: boolean, fileId: string }>}
 */
const deleteImage = async (fileId) => {
    if (!fileId) {
        throw new ApiError(400, "File ID is required for image deletion.");
    }

    try {
        await imagekit.deleteFile(fileId);
        return { success: true, fileId };
    } catch (error) {
        console.error("[ImageService] Delete error:", error);
        throw new ApiError(500, `Failed to delete image from ImageKit: ${error.message || error}`);
    }
};

/**
 * Retrieves metadata details of an image from ImageKit by fileId.
 *
 * @param {string} fileId - ImageKit fileId string
 * @returns {Promise<Object>} ImageKit file details object
 */
const getImageDetails = async (fileId) => {
    if (!fileId) {
        throw new ApiError(400, "File ID is required to fetch image details.");
    }

    try {
        const details = await imagekit.getFileDetails(fileId);
        return details;
    } catch (error) {
        console.error("[ImageService] Get details error:", error);
        throw new ApiError(500, `Failed to fetch image details: ${error.message || error}`);
    }
};

/**
 * Generates a transformed thumbnail URL dynamically.
 * Example: 200x200 crop with webp auto format.
 *
 * @param {string} url      - Original ImageKit image URL
 * @param {number} [width]  - Target width (default 200)
 * @param {number} [height] - Target height (default 200)
 * @returns {string} Transformed thumbnail URL
 */
const generateThumbnail = (url, width = 200, height = 200) => {
    return generateOptimizedUrl(url, { width, height, crop: "maintain_ratio", format: "webp", quality: 80 });
};

/**
 * Dynamic ImageKit URL builder with transformations support.
 * Supports resize, cropping, quality, and format transformations.
 *
 * @param {string} url                               - Base ImageKit image URL
 * @param {Object} options                           - Transformation options
 * @param {number} [options.width]                   - Target width
 * @param {number} [options.height]                  - Target height
 * @param {number} [options.quality]                 - Image quality (1-100)
 * @param {string} [options.format]                  - Format ("webp" | "avif" | "jpg" | "png" | "auto")
 * @param {string} [options.crop]                    - Crop mode ("maintain_ratio" | "force" | "at_least")
 * @returns {string} Transformed URL string
 */
const generateOptimizedUrl = (url, options = {}) => {
    if (!url) return "";

    const {
        width,
        height,
        quality = 80,
        format = "webp",
        crop = "maintain_ratio"
    } = options;

    try {
        if (typeof imagekit.url === "function") {
            const transformation = [{
                quality: String(quality),
                format: format
            }];

            if (width) transformation[0].width = String(width);
            if (height) transformation[0].height = String(height);
            if (crop) transformation[0].crop = crop;

            return imagekit.url({
                src: url,
                transformation
            });
        }
    } catch (e) {
        // Fallback parameter parsing if SDK helper is unconfigured
    }

    // Direct URL Parameter Fallback: Append tr=w-...,h-...,q-... to URL
    const trParams = [];
    if (width) trParams.push(`w-${width}`);
    if (height) trParams.push(`h-${height}`);
    if (quality) trParams.push(`q-${quality}`);
    if (format) trParams.push(`f-${format}`);

    if (trParams.length === 0) return url;

    const trString = `tr=${trParams.join(",")}`;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${trString}`;
};

module.exports = {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    getImageDetails,
    generateThumbnail,
    generateOptimizedUrl
};
