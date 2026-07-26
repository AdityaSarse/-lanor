const asyncHandler        = require("../utils/asyncHandler");
const ApiResponse         = require("../utils/ApiResponse");
const notificationService = require("../services/notification.service");

// ─────────────────────────────────────────────────────────────────────────────
// Notification Controller
// ─────────────────────────────────────────────────────────────────────────────

// ─── Dispatch Notification (Admin / System) ──────────────────────────────────
// POST /api/v1/notifications/send
const sendNotification = asyncHandler(async (req, res) => {
    const { to, type, payload } = req.body;

    const result = await notificationService.sendNotification({
        to,
        type,
        payload
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, `${type} notification sent successfully`));
});

// ─── Send Diagnostic Test Email (Admin) ──────────────────────────────────────
// POST /api/v1/notifications/test-email
const sendTestEmail = asyncHandler(async (req, res) => {
    const { to } = req.body;

    const result = await notificationService.sendEmail({
        to,
        subject: "Élanor - Test Email Diagnostic",
        html: "<h1>ÉLANOR</h1><p>This is a diagnostic email from your Élanor backend application.</p>",
        text: "ÉLANOR - This is a diagnostic email from your Élanor backend application."
    });

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Test email dispatched successfully"));
});

module.exports = {
    sendNotification,
    sendTestEmail
};
