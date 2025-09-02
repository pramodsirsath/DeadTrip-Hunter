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

module.exports = { sendCustomerEmail };
