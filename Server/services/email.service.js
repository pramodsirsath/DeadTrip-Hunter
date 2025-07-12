const nodemailer=require("nodemailer");

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER, // Your email address
        pass:process.env.EMAIL_PASS // Your email password or app password
    }
})

async function sendCustomerEmail(customerEmail, customerName, driver,load) {

    const mailOptions = {
    from: '"DeadTrip Hunter" <deadtrip.hunter@gmail.com>',
    to: customerEmail,
    subject: 'Your Load Has Been Accepted!',
    html: `
      <p>Hi ${customerName},</p>
      <p>Your load has been accepted by:</p>
      <ul>
        <li><b>Driver:</b> ${driver.name}</li>
        <li><b>Contact:</b> ${driver.phone}</li>
        <li><b>Vehicle No:</b> ${driver.vehicleNumber}</li>
      </ul>
      <p>Load Details:</p>
      <ul>
        <li><b>Source:</b> ${load.source}</li>
        <li><b>Destination:</b> ${load.destination}</li>
        <li><b>Date:</b> ${load.date}</li>
        <li><b>Truck Type:</b> ${load.truckType}</li>
        <li><b>Weight:</b> ${load.weight}</li>
      </ul>
      <p>Thank you for using our service!</p>
    `
  };

  await transporter.sendMail(mailOptions)


}

module.exports = {sendCustomerEmail};