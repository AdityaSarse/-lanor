/**
 * Generates HTML and Plain Text email templates for Payment Success notifications.
 *
 * @param {Object} params
 * @param {Object} params.user    - User details (name, email)
 * @param {Object} params.order   - Order details
 * @param {Object} params.payment - Payment receipt details (razorpayPaymentId, amount, status)
 * @returns {{ html: string, text: string }}
 */
const generatePaymentSuccessTemplate = ({ user, order, payment }) => {
    const customerName = user?.name || user?.fullName || "Valued Customer";
    const orderNumber  = order?.orderNumber || order?._id || "N/A";
    const paymentId    = payment?.razorpayPaymentId || payment?.paymentId || payment?.transactionId || "N/A";
    const amountPaid   = payment?.amount 
        ? `$${(Number(payment.amount) / (payment.amount > 1000 && !payment.isFormatted ? 100 : 1)).toFixed(2)}` 
        : (order?.totalAmount ? `$${Number(order.totalAmount).toFixed(2)}` : "$0.00");
    const paymentGateway = payment?.gateway || order?.paymentGateway || "Online Payment";
    const paymentDate  = payment?.createdAt ? new Date(payment.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

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
                .badge { display: inline-block; background: #28a745; color: white; padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
                .receipt-box { background: #fafafa; border: 1px dashed #ccc; padding: 20px; border-radius: 6px; margin: 20px 0; }
                .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #eee; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ÉLANOR</h1>
                </div>
                <div class="content">
                    <div class="badge">Payment Successful</div>
                    <h2>Payment Receipt</h2>
                    <p>Dear ${customerName},</p>
                    <p>We have successfully received your payment for order <strong>#${orderNumber}</strong>.</p>
                    
                    <div class="receipt-box">
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 6px 0; color: #666;">Transaction ID:</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: bold;">${paymentId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #666;">Order Number:</td>
                                <td style="padding: 6px 0; text-align: right;">#${orderNumber}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #666;">Payment Method:</td>
                                <td style="padding: 6px 0; text-align: right;">${paymentGateway}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #666;">Date:</td>
                                <td style="padding: 6px 0; text-align: right;">${paymentDate}</td>
                            </tr>
                            <tr style="border-top: 1px solid #ddd; font-weight: bold; font-size: 16px;">
                                <td style="padding: 12px 0 0 0;">Amount Paid:</td>
                                <td style="padding: 12px 0 0 0; text-align: right; color: #111;">${amountPaid}</td>
                            </tr>
                        </table>
                    </div>

                    <p>Your order is now being processed. You will receive another notification once your package has shipped.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Élanor Luxury Store. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
Payment Receipt - Élanor

Dear ${customerName},

Payment Successful! We have received your payment of ${amountPaid} for order #${orderNumber}.

Payment Details:
Transaction ID: ${paymentId}
Order Number: #${orderNumber}
Payment Gateway: ${paymentGateway}
Date: ${paymentDate}
Amount Paid: ${amountPaid}

Thank you for choosing Élanor.
    `.trim();

    return { html, text };
};

module.exports = generatePaymentSuccessTemplate;
