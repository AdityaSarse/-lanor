/**
 * Generates HTML and Plain Text email templates for Order Delivered notifications.
 *
 * @param {Object} params
 * @param {Object} params.user  - User details (name, email)
 * @param {Object} params.order - Order details
 * @returns {{ html: string, text: string }}
 */
const generateOrderDeliveredTemplate = ({ user, order }) => {
    const customerName = user?.name || user?.fullName || "Valued Customer";
    const orderNumber  = order?.orderNumber || order?._id || "N/A";
    const deliveryDate = order?.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : new Date().toLocaleDateString();

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
                .delivered-box { background: #eef9f2; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #eee; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ÉLANOR</h1>
                </div>
                <div class="content">
                    <h2>Order Delivered!</h2>
                    <p>Dear ${customerName},</p>
                    <p>Your order <strong>#${orderNumber}</strong> was successfully delivered on <strong>${deliveryDate}</strong>.</p>
                    
                    <div class="delivered-box">
                        <h3 style="margin: 0 0 10px 0;">We hope you love your purchase!</h3>
                        <p style="margin: 0; font-size: 14px;">Thank you for shopping with Élanor. If you have a moment, we would love to hear your thoughts.</p>
                    </div>

                    <p>If you have any issues with your package or items, please reach out to our customer support within 7 days.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Élanor Luxury Store. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
Order Delivered - Élanor

Dear ${customerName},

Your order #${orderNumber} was delivered on ${deliveryDate}.

We hope you enjoy your purchase!

Thank you for choosing Élanor.
    `.trim();

    return { html, text };
};

module.exports = generateOrderDeliveredTemplate;
