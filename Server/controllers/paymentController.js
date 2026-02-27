const stripe = require("../config/stripe");
const RideReservation = require("../models/RideReservation");
const Ride = require("../models/ride");

exports.createCheckoutSession = async (req, res) => {
  const { reservationId } = req.body;

  const reservation = await RideReservation.findById(reservationId);
  const ride = await Ride.findById(reservation.rideId);
const fare = ride.fare >= 50 ? ride.fare :200;
  if (!reservation) {
    return res.status(400).json({ message: "Reservation not found" });
  }

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
   success_url: "http://localhost:5173/customer/dashboard?payment=success",
cancel_url: "http://localhost:5173/customer/dashboard?payment=failed"
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

      await ride.save();

      // 🧹 Remove reservation after success
      await RideReservation.deleteOne({ _id: reservation._id });

      console.log("Ride successfully accepted after payment");

    } catch (err) {
      console.error("Webhook processing error:", err);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  }

  res.json({ received: true });
};