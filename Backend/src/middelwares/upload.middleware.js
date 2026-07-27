let multer;
try {
    multer = require("multer");
} catch (err) {
    console.warn("[Upload Middleware] Warning: 'multer' package is not installed. Run 'npm install multer'.");
}

const ApiError = require("../utils/ApiError");

// ─────────────────────────────────────────────────────────────────────────────
// Multer In-Memory Upload Middleware
//
// Receives multipart/form-data files from client and stores them in RAM Buffer memory.
// Buffers are passed directly to ImageKit SDK without saving temporary files to disk.
// ─────────────────────────────────────────────────────────────────────────────

const storage = multer ? multer.memoryStorage() : null;

// File Filter: Allow only image MIME types
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/avif",
        "image/gif"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, `Invalid file type: ${file.mimetype}. Allowed types: JPG, PNG, WEBP, AVIF, GIF`), false);
    }
};

const upload = multer
    ? multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5 MB max per file
        }
    })
    : {
        single: () => (req, res, next) => next(new ApiError(500, "Multer is not installed. Please run 'npm install multer'.")),
        array: () => (req, res, next) => next(new ApiError(500, "Multer is not installed. Please run 'npm install multer'."))
    };

const uploadSingle   = upload.single("image");
const uploadMultiple = upload.array("images", 10);

module.exports = {
    uploadSingle,
    uploadMultiple
};
