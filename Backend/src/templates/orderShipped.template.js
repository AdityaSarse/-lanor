/**
 * Generates HTML and Plain Text email templates for Order Shipped notifications.
 *
 * @param {Object} params
 * @param {Object} params.user              - User details (name, email)
 * @param {Object} params.order             - Order details
 * @param {string} [params.carrier]         - Shipping carrier name (e.g. BlueDart, FedEx)
 * @param {string} [params.trackingNumber]  - Waybill / Tracking code
 * @param {string} [params.trackingUrl]     - Direct tracking link
 * @param {string} [params.estimatedDelivery] - Estimated arrival date string
 * @returns {{ html: string, text: string }}
 */
const generateOrderShippedTemplate = ({
    user,
    order,
    carrier = "Standard Express",
    trackingNumber = "N/A",
    trackingUrl = "#",
    estimatedDelivery = "3-5 Business Days"
}) => {
    const customerName = user?.name || user?.fullName || "Valued Customer";
    const orderNumber  = order?.orderNumber || order?._id || "N/A";

    const itemsList = (order?.items || []).map(item => {
        const productName = item.product?.name || item.name || "Product";
        const qty = item.quantity || 1;
        return `${productName} (x${qty})`;
    }).join(", ");

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
                .shipment-card { background: #f4f6f9; border-left: 4px solid #111; padding: 20px; border-radius: 4px; margin: 20px 0; }
                .btn { display: inline-block; background-color: #111111; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 15px; }
                .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #eee; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ÉLANOR</h1>
                </div>
                <div class="content">
                    <h2>On Its Way!</h2>
                    <p>Dear ${customerName},</p>
                    <p>Great news! Your order <strong>#${orderNumber}</strong> has been shipped and is on its way to your delivery address.</p>
                    
                    <div class="shipment-card">
                        <p style="margin: 5px 0;"><strong>Courier Partner:</strong> ${carrier}</p>
                        <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
                        <p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
                        ${itemsList ? `<p style="margin: 10px 0 5px 0; font-size: 13px; color: #666;"><strong>Items Shipped:</strong> ${itemsList}</p>` : ""}
                        
                        ${trackingNumber !== "N/A" ? `<a href="${trackingUrl}" class="btn" target="_blank">Track Package</a>` : ""}
                    </div>

                    <p>If you have any questions regarding your delivery, feel free to reply to this email or contact support.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Élanor Luxury Store. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
Your Order Has Shipped - Élanor

Dear ${customerName},

Great news! Your order #${orderNumber} has been shipped.

Tracking Information:
Courier: ${carrier}
Tracking Number: ${trackingNumber}
Estimated Delivery: ${estimatedDelivery}
${trackingUrl !== "#" ? `Track Here: ${trackingUrl}` : ""}

Thank you for shopping with Élanor.
    `.trim();

    return { html, text };
};

module.exports = generateOrderShippedTemplate;
