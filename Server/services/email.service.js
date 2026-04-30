require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendCustomerEmail(customerEmail, customerName, driver, load) {
    console.log("Sending email to:", customerEmail);

    const mailOptions = {
        from: `"DeadTrip Hunter" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: 'Your Load Has Been Accepted!',
        html: `
            <p>Hi ${customerName},</p>
            <p>Your load has been accepted by:</p>
            <ul>
                <li><b>Driver:</b> ${driver.driverName}</li>
                <li><b>Contact:</b> ${driver.phone}</li>
                <li><b>Vehicle No:</b> ${driver.vehicleNumber || 'N/A'}</li>
            </ul>
            <p>Load Details:</p>
            <ul>
                <li><b>Source:</b> ${load.source}</li>
                <li><b>Destination:</b> ${load.destination}</li>
                <li><b>Date:</b> ${load.date}</li>
                <li><b>Truck Type:</b> ${driver.truckType}</li>
                <li><b>Weight:</b> ${load.weight}</li>
            </ul>
            <p>Thank you for using our service!</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
    } catch (err) {
        console.error("Error sending email:", err);
    }
}

async function sendOtpEmail(email, otp) {
    console.log("Sending OTP email to:", email);
    const mailOptions = {
        from: `"DeadTrip Hunter" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'DeadTrip Hunter - Email Verification OTP',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                <h2>Confirm your email address</h2>
                <p>Welcome to DeadTrip Hunter! Please use the following One-Time Password to complete your registration:</p>
                <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px; border-radius: 5px;">${otp}</h1>
                <p>This code will expire in 5 minutes.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("OTP Email sent:", info.messageId);
    } catch (err) {
        console.error("Error sending OTP email:", err);
    }
}

/**
 * Send ride acceptance email to BOTH customer and driver
 * Called after successful payment when ride status changes to "accepted"
 */
async function sendRideAcceptedEmail({ customer, driver, ride, sourceAddress, destinationAddress }) {
    const dateStr = ride.date ? new Date(ride.date).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : 'N/A';

    const bookingAmount = ride.advancePaid || 0;

    // ── Email to Customer ──
    const customerMailOptions = {
        from: `"DeadTrip Hunter" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: '✅ Ride Confirmed — Your Load Has Been Accepted!',
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🚛 Ride Confirmed!</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your load has been successfully booked</p>
            </div>
            
            <div style="padding: 24px;">
                <p style="font-size: 16px; color: #374151;">Hi <strong>${customer.name}</strong>,</p>
                <p style="font-size: 14px; color: #6b7280;">Great news! A driver has accepted your load and payment is confirmed. Here are your ride details:</p>

                <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                    <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 15px;">📍 Route Details</h3>
                    <table style="width: 100%; font-size: 14px; color: #374151;">
                        <tr><td style="padding: 4px 0; color: #6b7280;">Source:</td><td style="padding: 4px 0; font-weight: 600;">${sourceAddress}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Destination:</td><td style="padding: 4px 0; font-weight: 600;">${destinationAddress}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Date:</td><td style="padding: 4px 0; font-weight: 600;">${dateStr}</td></tr>
                    </table>
                </div>

                <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #22c55e;">
                    <h3 style="margin: 0 0 12px; color: #166534; font-size: 15px;">🚚 Driver Details</h3>
                    <table style="width: 100%; font-size: 14px; color: #374151;">
                        <tr><td style="padding: 4px 0; color: #6b7280;">Driver Name:</td><td style="padding: 4px 0; font-weight: 600;">${driver.name}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Phone:</td><td style="padding: 4px 0; font-weight: 600;">${driver.phone}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Vehicle No:</td><td style="padding: 4px 0; font-weight: 600;">${driver.truckNumber || 'N/A'}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Truck Type:</td><td style="padding: 4px 0; font-weight: 600;">${ride.truckType}</td></tr>
                    </table>
                </div>

                <div style="background: #fefce8; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #eab308;">
                    <h3 style="margin: 0 0 12px; color: #854d0e; font-size: 15px;">📦 Load Info</h3>
                    <table style="width: 100%; font-size: 14px; color: #374151;">
                        <tr><td style="padding: 4px 0; color: #6b7280;">Weight:</td><td style="padding: 4px 0; font-weight: 600;">${ride.weight}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Details:</td><td style="padding: 4px 0; font-weight: 600;">${ride.loadDetails}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Fare:</td><td style="padding: 4px 0; font-weight: 600;">₹${ride.fare}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Booking Amount Paid:</td><td style="padding: 4px 0; font-weight: 600; color: #22c55e;">₹${bookingAmount}</td></tr>
                    </table>
                </div>

                <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 24px;">
                    Thank you for using DeadTrip Hunter! 🚀
                </p>
            </div>
        </div>
        `
    };

    // ── Email to Driver ──
    const driverMailOptions = {
        from: `"DeadTrip Hunter" <${process.env.EMAIL_USER}>`,
        to: driver.email,
        subject: '✅ Ride Accepted — New Load Assignment!',
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background: linear-gradient(135deg, #22c55e, #059669); padding: 32px 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🚛 New Load Assigned!</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Payment received — ride confirmed</p>
            </div>
            
            <div style="padding: 24px;">
                <p style="font-size: 16px; color: #374151;">Hi <strong>${driver.name}</strong>,</p>
                <p style="font-size: 14px; color: #6b7280;">A customer has confirmed the ride with payment. Here are the details:</p>

                <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                    <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 15px;">📍 Route Details</h3>
                    <table style="width: 100%; font-size: 14px; color: #374151;">
                        <tr><td style="padding: 4px 0; color: #6b7280;">Source:</td><td style="padding: 4px 0; font-weight: 600;">${sourceAddress}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Destination:</td><td style="padding: 4px 0; font-weight: 600;">${destinationAddress}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Date:</td><td style="padding: 4px 0; font-weight: 600;">${dateStr}</td></tr>
                    </table>
                </div>

                <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <h3 style="margin: 0 0 12px; color: #92400e; font-size: 15px;">👤 Customer Details</h3>
                    <table style="width: 100%; font-size: 14px; color: #374151;">
                        <tr><td style="padding: 4px 0; color: #6b7280;">Customer Name:</td><td style="padding: 4px 0; font-weight: 600;">${customer.name}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Phone:</td><td style="padding: 4px 0; font-weight: 600;">${customer.phone}</td></tr>
                    </table>
                </div>

                <div style="background: #fefce8; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #eab308;">
                    <h3 style="margin: 0 0 12px; color: #854d0e; font-size: 15px;">📦 Load Info</h3>
                    <table style="width: 100%; font-size: 14px; color: #374151;">
                        <tr><td style="padding: 4px 0; color: #6b7280;">Truck Type:</td><td style="padding: 4px 0; font-weight: 600;">${ride.truckType}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Weight:</td><td style="padding: 4px 0; font-weight: 600;">${ride.weight}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Details:</td><td style="padding: 4px 0; font-weight: 600;">${ride.loadDetails}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Fare:</td><td style="padding: 4px 0; font-weight: 600;">₹${ride.fare}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Booking Amount:</td><td style="padding: 4px 0; font-weight: 600; color: #22c55e;">₹${bookingAmount}</td></tr>
                    </table>
                </div>

                <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 24px;">
                    Thank you for driving with DeadTrip Hunter! 🚀
                </p>
            </div>
        </div>
        `
    };

    try {
        console.log("[EMAIL] Sending ride accepted email to customer:", customer.email);
        await transporter.sendMail(customerMailOptions);
        console.log("[EMAIL] ✅ Customer email sent");

        console.log("[EMAIL] Sending ride accepted email to driver:", driver.email);
        await transporter.sendMail(driverMailOptions);
        console.log("[EMAIL] ✅ Driver email sent");
    } catch (err) {
        console.error("[EMAIL] ❌ Error sending ride accepted emails:", err);
    }
}

/**
 * Send cancellation email to BOTH customer and driver
 */
async function sendCancellationEmail({ customer, driver, ride, sourceAddress, destinationAddress, refundAmount, driverCompensation, cancelledBy }) {
    const dateStr = ride.date ? new Date(ride.date).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : 'N/A';

    const cancelledByLabel = cancelledBy === 'customer' ? 'Customer' : 'Driver';

    // ── Email to Customer ──
    const customerMailOptions = {
        from: `"DeadTrip Hunter" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: `❌ Ride Cancelled — ${cancelledBy === 'customer' ? 'Your cancellation' : 'Driver cancelled'}`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">❌ Ride Cancelled</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Cancelled by ${cancelledByLabel}</p>
            </div>
            
            <div style="padding: 24px;">
                <p style="font-size: 16px; color: #374151;">Hi <strong>${customer.name}</strong>,</p>
                <p style="font-size: 14px; color: #6b7280;">Your ride has been cancelled. Here is the summary:</p>

                <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                    <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 15px;">📍 Route</h3>
                    <table style="width: 100%; font-size: 14px; color: #374151;">
                        <tr><td style="padding: 4px 0; color: #6b7280;">Source:</td><td style="padding: 4px 0; font-weight: 600;">${sourceAddress}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Destination:</td><td style="padding: 4px 0; font-weight: 600;">${destinationAddress}</td></tr>
                    </table>
                </div>

                <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #ef4444;">
                    <h3 style="margin: 0 0 12px; color: #991b1b; font-size: 15px;">💰 Refund Summary</h3>
                    <table style="width: 100%; font-size: 14px; color: #374151;">
                        <tr><td style="padding: 4px 0; color: #6b7280;">Your Refund:</td><td style="padding: 4px 0; font-weight: 700; color: #22c55e; font-size: 16px;">₹${refundAmount}</td></tr>
                        <tr><td style="padding: 4px 0; color: #6b7280;">Cancellation Fee:</td><td style="padding: 4px 0; font-weight: 600; color: #ef4444;">₹${driverCompensation}</td></tr>
                    </table>
                </div>

                ${ride.cancellationReason ? `<p style="font-size: 13px; color: #6b7280; font-style: italic;">Reason: ${ride.cancellationReason}</p>` : ''}
            </div>
        </div>
        `
    };

    // ── Email to Driver (only if driver was assigned) ──
    let driverMailOptions = null;
    if (driver && driver.email) {
        driverMailOptions = {
            from: `"DeadTrip Hunter" <${process.env.EMAIL_USER}>`,
            to: driver.email,
            subject: `❌ Ride Cancelled — ${cancelledBy === 'driver' ? 'Your cancellation' : 'Customer cancelled'}`,
            html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
                <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">❌ Ride Cancelled</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Cancelled by ${cancelledByLabel}</p>
                </div>
                
                <div style="padding: 24px;">
                    <p style="font-size: 16px; color: #374151;">Hi <strong>${driver.name}</strong>,</p>
                    <p style="font-size: 14px; color: #6b7280;">A ride has been cancelled. Here is the summary:</p>

                    <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                        <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 15px;">📍 Route</h3>
                        <table style="width: 100%; font-size: 14px; color: #374151;">
                            <tr><td style="padding: 4px 0; color: #6b7280;">Source:</td><td style="padding: 4px 0; font-weight: 600;">${sourceAddress}</td></tr>
                            <tr><td style="padding: 4px 0; color: #6b7280;">Destination:</td><td style="padding: 4px 0; font-weight: 600;">${destinationAddress}</td></tr>
                        </table>
                    </div>

                    <div style="background: ${cancelledBy === 'customer' ? '#f0fdf4' : '#fef2f2'}; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid ${cancelledBy === 'customer' ? '#22c55e' : '#ef4444'};">
                        <h3 style="margin: 0 0 12px; color: ${cancelledBy === 'customer' ? '#166534' : '#991b1b'}; font-size: 15px;">💰 Settlement</h3>
                        <table style="width: 100%; font-size: 14px; color: #374151;">
                            <tr><td style="padding: 4px 0; color: #6b7280;">Your Compensation:</td><td style="padding: 4px 0; font-weight: 700; color: #22c55e; font-size: 16px;">₹${driverCompensation}</td></tr>
                            <tr><td style="padding: 4px 0; color: #6b7280;">Customer Refund:</td><td style="padding: 4px 0; font-weight: 600; color: #6b7280;">₹${refundAmount}</td></tr>
                        </table>
                    </div>

                    ${ride.cancellationReason ? `<p style="font-size: 13px; color: #6b7280; font-style: italic;">Reason: ${ride.cancellationReason}</p>` : ''}
                </div>
            </div>
            `
        };
    }

    try {
        console.log("[EMAIL] Sending cancellation email to customer:", customer.email);
        await transporter.sendMail(customerMailOptions);
        console.log("[EMAIL] ✅ Customer cancellation email sent");

        if (driverMailOptions) {
            console.log("[EMAIL] Sending cancellation email to driver:", driver.email);
            await transporter.sendMail(driverMailOptions);
            console.log("[EMAIL] ✅ Driver cancellation email sent");
        }
    } catch (err) {
        console.error("[EMAIL] ❌ Error sending cancellation emails:", err);
    }
}

module.exports = { sendCustomerEmail, sendOtpEmail, sendRideAcceptedEmail, sendCancellationEmail };
