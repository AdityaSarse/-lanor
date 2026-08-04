require("dotenv").config();
const ImageKit = require("@imagekit/nodejs");

const privateKey = (process.env.IMAGEKIT_PRIVATE_KEY || "").trim() || "private_placeholder_key";

const imagekit = new ImageKit({
    privateKey
});

module.exports = imagekit;
