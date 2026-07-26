let nodemailer;
try {
    nodemailer = require("nodemailer");
} catch (error) {
    console.warn("[Mail Config] Warning: 'nodemailer' package is not installed or failed to load. Please run 'npm install nodemailer'.");
}

const createTransporter = () => {
    if (!nodemailer) {
        return {
            sendMail: async (options) => {
                console.log("[Mail Config Mock Dispatch]", options);
                return { messageId: "mock-id-nodemailer-not-installed" };
            }
        };
    }

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT, 10) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    if (host && user && pass) {
        return nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass
            }
        });
    }

    // Fallback stream / json transport for development/testing when SMTP is unconfigured
    return nodemailer.createTransport({
        jsonTransport: true
    });
};

const transporter = createTransporter();

const EMAIL_FROM = process.env.EMAIL_FROM || "Élanor <noreply@elanor.com>";

module.exports = {
    transporter,
    EMAIL_FROM
};
