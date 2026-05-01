const stripe = require("../config/stripe");
const RideReservation = require("../models/RideReservation");
const Ride = require("../models/ride");
const User = require("../models/user");
const Withdrawal = require("../models/Withdrawal");
const { sendRideAcceptedEmail } = require("../services/email.service");

// Helper: reverse geocode coordinates to address string
const getAddress = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          "User-Agent": "DeadtripHunter/1.0 (contact@deadtrip.com)"
        }
      }
    );
    const data = await res.json();
    if (data.address) {
      const taluka = data.address.village || data.address.town || data.address.suburb || data.address.city || data.address.county || "";
      const district = data.address.state_district || data.address.county || "";
      const state = data.address.state || "";
      const parts = [];
      if (taluka) parts.push(taluka);
      if (district && district !== taluka) parts.push(district);
      if (state && state !== district && state !== taluka) parts.push(state);
      return parts.join(", ") || "Unknown Location";
    }
    return data.display_name || "Unknown";
  } catch (err) {
    console.error("Error fetching address:", err);
    return "Unknown";
  }
};

// Helper: send emails after ride acceptance
const sendAcceptanceEmails = async (ride) => {
  try {
    const customer = await User.findById(ride.customer_id);
    const driver = await User.findById(ride.driverId);

    if (!customer || !driver) {
      console.error("[EMAIL] Customer or driver not found for ride:", ride._id);
      return;
    }

    // Get readable addresses
    const [srcLng, srcLat] = ride.source?.coordinates || [];
    const [destLng, destLat] = ride.destination?.coordinates || [];

    const sourceAddress = srcLat && srcLng ? await getAddress(srcLat, srcLng) : "N/A";
    const destinationAddress = destLat && destLng ? await getAddress(destLat, destLng) : "N/A";

    await sendRideAcceptedEmail({
      customer,
      driver,
      ride,
      sourceAddress,
      destinationAddress,
    });

    console.log("[PAYMENT] ✅ Acceptance emails sent successfully");
  } catch (err) {
    // Don't let email failure break the payment flow
    console.error("[PAYMENT] ❌ Failed to send acceptance emails:", err);
  }
};

exports.createCheckoutSession = async (req, res) => {
  const { reservationId } = req.body;

  const reservation = await RideReservation.findById(reservationId);
  const ride = await Ride.findById(reservation.rideId);
const fare = ride.fare >= 50 ? ride.fare :200;
  if (!reservation) {
    return res.status(400).json({ message: "Reservation not found" });
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "Ride Booking Payment"
          },
          unit_amount: fare * 25 // Convert to paise
        },
        quantity: 1
      }
    ],
   success_url: `${frontendUrl}/customer/dashboard?payment=success&reservationId=${reservation._id}`,
   cancel_url: `${frontendUrl}/customer/dashboard?payment=failed`
  });

  reservation.paymentSessionId = session.id;
  await reservation.save();

  res.json({ url: session.url });
};

exports.stripeWebhook = async (req, res) => {
  console.log("Webhook received");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Only process completed checkout
  if (event.type === "checkout.session.completed") {

    const session = event.data.object;

    try {
      const reservation = await RideReservation.findOne({
        paymentSessionId: session.id
      });

      if (!reservation) {
        console.log("No reservation found for session:", session.id);
        return res.json({ received: true });
      }

      const ride = await Ride.findById(reservation.rideId);

      if (!ride) {
        console.log("Ride not found");
        return res.json({ received: true });
      }

      // 🛑 Prevent double acceptance
      if (ride.status === "accepted") {
        console.log("Ride already accepted");
        return res.json({ received: true });
      }

      // ✅ Final acceptance happens here
      ride.status = "accepted";
      ride.driverId = reservation.driverId;
      ride.acceptedAt = new Date();
      ride.advancePaid = (ride.fare >= 50 ? ride.fare : 200) * 0.25;

      await ride.save();

      // 🧹 Remove reservation after success
      await RideReservation.deleteOne({ _id: reservation._id });

      console.log("Ride successfully accepted after payment");

      // 📧 Send emails to both customer and driver
      await sendAcceptanceEmails(ride);

    } catch (err) {
      console.error("Webhook processing error:", err);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  }

  res.json({ received: true });
};

exports.verifySession = async (req, res) => {
  const { reservationId } = req.body;
  try {
    const reservation = await RideReservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found or already processed" });
    }

    if (!reservation.paymentSessionId) {
      return res.status(400).json({ message: "No payment session found" });
    }

    const session = await stripe.checkout.sessions.retrieve(reservation.paymentSessionId);

    if (session.payment_status === "paid") {
      const ride = await Ride.findById(reservation.rideId);
      if (ride && ride.status !== "accepted") {
        ride.status = "accepted";
        ride.driverId = reservation.driverId;
        ride.acceptedAt = new Date();
        ride.advancePaid = (ride.fare >= 50 ? ride.fare : 200) * 0.25;
        await ride.save();

        await RideReservation.deleteOne({ _id: reservation._id });

        // 📧 Send emails to both customer and driver
        await sendAcceptanceEmails(ride);

        return res.json({ success: true, message: "Payment verified and ride accepted." });
      }
      return res.json({ success: true, message: "Ride already accepted." });
    } else {
      return res.json({ success: false, message: "Payment not completed." });
    }
  } catch (error) {
    console.error("Error verifying session", error);
    res.status(500).json({ error: "Failed to verify session" });
  }
};

exports.withdrawFunds = async (req, res) => {
  const { driverId, amount, upiId } = req.body;

  try {
    if (!driverId || !amount || !upiId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ error: "Driver not found" });
    }

    if (driver.walletBalance < amount) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    // Deduct from wallet
    driver.walletBalance -= amount;
    await driver.save();

    // Create withdrawal record
    const withdrawal = await Withdrawal.create({
      driverId,
      amount,
      upiId,
      status: "pending" // Admin must approve this
    });

    res.status(200).json({ 
      message: "Withdrawal successful", 
      withdrawal,
      newBalance: driver.walletBalance
    });

  } catch (error) {
    console.error("Error withdrawing funds:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getWithdrawalHistory = async (req, res) => {
  const { driverId } = req.params;
  try {
    const withdrawals = await Withdrawal.find({ driverId }).sort({ createdAt: -1 });
    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};