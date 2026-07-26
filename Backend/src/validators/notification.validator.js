const { body } = require("express-validator");
const { NOTIFICATION_TYPE_VALUES } = require("../constants/notification.constants");

// ─────────────────────────────────────────────────────────────────────────────
// Notification Validators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validator for manual/admin notification dispatch endpoint.
 */
const sendNotificationValidator = [
    body("to")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Must provide a valid email address"),

    body("type")
        .trim()
        .notEmpty()
        .withMessage("Notification type is required")
        .bail()
        .isIn(NOTIFICATION_TYPE_VALUES)
        .withMessage(`Invalid notification type. Must be one of: ${NOTIFICATION_TYPE_VALUES.join(", ")}`),

    body("payload")
        .optional()
        .isObject()
        .withMessage("Payload must be an object")
];

/**
 * Validator for diagnostic test email endpoint.
 */
const testEmailValidator = [
    body("to")
        .trim()
        .notEmpty()
        .withMessage("Recipient email address ('to') is required")
        .bail()
        .isEmail()
        .withMessage("Must provide a valid email address")
];

module.exports = {
    sendNotificationValidator,
    testEmailValidator
};
