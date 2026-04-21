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

module.exports = { sendCustomerEmail, sendOtpEmail };
