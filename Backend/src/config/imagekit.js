let ImageKit;
let imagekit;

try {
    ImageKit = require("@imagekit/nodejs");
} catch (err) {
    try {
        ImageKit = require("imagekit");
    } catch (e) {
        console.warn("[ImageKit Config] Warning: Neither '@imagekit/nodejs' nor 'imagekit' package is installed.");
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageKit SDK Configuration
//
// Single source of truth for ImageKit client initialization.
// Reads credentials from process.env with safe fallback handling.
// ─────────────────────────────────────────────────────────────────────────────

if (ImageKit) {
    const sanitize = (val) => (val ? val.trim().replace(/^["']|["']$/g, '') : "");

    const publicKey   = sanitize(process.env.IMAGEKIT_PUBLIC_KEY || process.env.PUBLIC_KEY) || "public_placeholder";
    const privateKey  = sanitize(process.env.IMAGEKIT_PRIVATE_KEY) || "private_placeholder";
    const urlEndpoint = sanitize(process.env.IMAGEKIT_URL_ENDPOINT || process.env.URL_END_POINT) || "https://ik.imagekit.io/placeholder";

    imagekit = new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint
    });
} else {
    imagekit = {
        upload: async () => { throw new Error("ImageKit SDK is not installed."); },
        deleteFile: async () => { throw new Error("ImageKit SDK is not installed."); },
        getFileDetails: async () => { throw new Error("ImageKit SDK is not installed."); },
        url: () => "https://ik.imagekit.io/placeholder/image.jpg"
    };
}

module.exports = imagekit;
