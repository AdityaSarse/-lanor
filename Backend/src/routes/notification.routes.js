const express = require("express");
const router  = express.Router();

const notificationController = require("../controllers/notification.controller");
const validate               = require("../middelwares/validation.middleware");
const { verifyJWT, verifyRole } = require("../middelwares/auth.middleware");

const {
    sendNotificationValidator,
    testEmailValidator
} = require("../validators/notification.validator");

// ─────────────────────────────────────────────────────────────────────────────
// Notification Routes
// ─────────────────────────────────────────────────────────────────────────────

// ─── Protected Admin Routes ───────────────────────────────────────────────────

// POST /api/v1/notifications/send — Manually dispatch a notification
router.post(
    "/send",
    verifyJWT,
    verifyRole("admin"),
    sendNotificationValidator,
    validate,
    notificationController.sendNotification
);

// POST /api/v1/notifications/test-email — Send a test diagnostic email
router.post(
    "/test-email",
    verifyJWT,
    verifyRole("admin"),
    testEmailValidator,
    validate,
    notificationController.sendTestEmail
);

module.exports = router;
