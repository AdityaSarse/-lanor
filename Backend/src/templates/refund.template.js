/**
 * Generates HTML and Plain Text email templates for Refund Processed notifications.
 *
 * @param {Object} params
 * @param {Object} params.user   - User details (name, email)
 * @param {Object} params.order  - Order details
 * @param {Object} params.refund - Refund transaction details (refundId, amount, reason, status)
 * @returns {{ html: string, text: string }}
 */
const generateRefundTemplate = ({ user, order, refund }) => {
    const customerName = user?.name || user?.fullName || "Valued Customer";
    const orderNumber  = order?.orderNumber || order?._id || "N/A";
    const refundId     = refund?.refundId || refund?._id || "N/A";
    const refundAmount = refund?.amount 
        ? `$${Number(refund.amount).toFixed(2)}` 
        : (order?.totalAmount ? `$${Number(order.totalAmount).toFixed(2)}` : "$0.00");
    const reason       = refund?.reason || "Customer Return / Order Cancellation";

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; color: #333; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .header { background-color: #111111; color: #d4af37; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 26px; letter-spacing: 2px; font-weight: 300; }
                .content { padding: 30px; }
                .refund-box { background: #fff8e6; border: 1px solid #ffeba8; padding: 20px; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #eee; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ÉLANOR</h1>
                </div>
                <div class="content">
                    <h2>Refund Processed</h2>
                    <p>Dear ${customerName},</p>
                    <p>We have processed a refund for your order <strong>#${orderNumber}</strong>.</p>
                    
                    <div class="refund-box">
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 6px 0; color: #666;">Refund ID:</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: bold;">${refundId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #666;">Order Number:</td>
                                <td style="padding: 6px 0; text-align: right;">#${orderNumber}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #666;">Reason:</td>
                                <td style="padding: 6px 0; text-align: right;">${reason}</td>
                            </tr>
                            <tr style="border-top: 1px solid #ddd; font-weight: bold; font-size: 16px;">
                                <td style="padding: 12px 0 0 0;">Refund Amount:</td>
                                <td style="padding: 12px 0 0 0; text-align: right; color: #b71c1c;">${refundAmount}</td>
                            </tr>
                        </table>
                    </div>

                    <p>Please allow 5–7 business days for the refunded amount to reflect in your original payment method, depending on your bank.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Élanor Luxury Store. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
Refund Processed - Élanor

Dear ${customerName},

A refund of ${refundAmount} has been processed for order #${orderNumber}.

Refund Details:
Refund ID: ${refundId}
Order Number: #${orderNumber}
Reason: ${reason}
Refund Amount: ${refundAmount}

The funds should reflect in your account within 5-7 business days.

Thank you for choosing Élanor.
    `.trim();

    return { html, text };
};

module.exports = generateRefundTemplate;
