/**
 * Generates HTML and Plain Text email templates for Order Placed notifications.
 *
 * @param {Object} params
 * @param {Object} params.user  - User details (name, email)
 * @param {Object} params.order - Populated Order document
 * @returns {{ html: string, text: string }}
 */
const generateOrderPlacedTemplate = ({ user, order }) => {
    const customerName = user?.name || user?.fullName || "Valued Customer";
    const orderNumber  = order?.orderNumber || order?._id || "N/A";
    const totalAmount  = order?.totalAmount ? `$${Number(order.totalAmount).toFixed(2)}` : "$0.00";
    const shippingFee  = order?.shippingFee ? `$${Number(order.shippingFee).toFixed(2)}` : "Free";
    const discount     = order?.discountAmount ? `-$${Number(order.discountAmount).toFixed(2)}` : "$0.00";
    const paymentMethod= order?.paymentMethod || "N/A";
    
    const itemsList = (order?.items || []).map(item => {
        const productName = item.product?.name || item.name || "Product";
        const qty = item.quantity || 1;
        const price = item.price ? `$${Number(item.price).toFixed(2)}` : "$0.00";
        const itemTotal = item.itemTotal ? `$${Number(item.itemTotal).toFixed(2)}` : price;
        return { productName, qty, price, itemTotal };
    });

    const itemsHtml = itemsList.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.itemTotal}</td>
        </tr>
    `).join("");

    const itemsText = itemsList.map(i => `- ${i.productName} (x${i.qty}): ${i.itemTotal}`).join("\n");

    const shippingAddress = order?.shippingAddress ? `
        ${order.shippingAddress.fullName || ""}<br>
        ${order.shippingAddress.addressLine1 || ""}, ${order.shippingAddress.addressLine2 || ""}<br>
        ${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""} ${order.shippingAddress.postalCode || ""}<br>
        ${order.shippingAddress.country || ""}
    ` : "Shipping Address Provided";

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
                .order-info { background: #fdfdfd; border: 1px solid #eaeaea; padding: 15px; border-radius: 6px; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #f4f4f4; padding: 10px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase; }
                .total-row { font-weight: bold; font-size: 16px; background: #fafafa; }
                .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #eee; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ÉLANOR</h1>
                </div>
                <div class="content">
                    <h2>Order Confirmed!</h2>
                    <p>Dear ${customerName},</p>
                    <p>Thank you for shopping with Élanor. We have received your order and are currently preparing it for processing.</p>
                    
                    <div class="order-info">
                        <strong>Order Number:</strong> #${orderNumber}<br>
                        <strong>Payment Method:</strong> ${paymentMethod}<br>
                        <strong>Status:</strong> ${order?.orderStatus || "Pending"}
                    </div>

                    <h3>Order Summary</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <table style="margin-top: 10px;">
                        <tr>
                            <td style="text-align: right; padding: 6px 12px;">Shipping:</td>
                            <td style="text-align: right; padding: 6px 12px; width: 100px;">${shippingFee}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right; padding: 6px 12px;">Discount:</td>
                            <td style="text-align: right; padding: 6px 12px;">${discount}</td>
                        </tr>
                        <tr class="total-row">
                            <td style="text-align: right; padding: 12px;">Grand Total:</td>
                            <td style="text-align: right; padding: 12px;">${totalAmount}</td>
                        </tr>
                    </table>

                    <h3>Shipping Address</h3>
                    <p>${shippingAddress}</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Élanor Luxury Store. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
Order Confirmation - Élanor

Dear ${customerName},

Thank you for your order #${orderNumber}!

Order Details:
Payment Method: ${paymentMethod}
Total Amount: ${totalAmount}

Items Ordered:
${itemsText}

Grand Total: ${totalAmount}

Thank you for choosing Élanor.
    `.trim();

    return { html, text };
};

module.exports = generateOrderPlacedTemplate;
