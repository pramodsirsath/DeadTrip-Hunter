const Ride = require("../models/ride");
const RideReservation = require("../models/RideReservation");
const stripe = require("../config/stripe");




exports.getDriverActiveReservation = async (req, res) => {
  try {

    const driverId = req.user.id; // if using auth middleware

    const reservation = await RideReservation.findOne({
      driverId,
      expiresAt: { $gt: new Date() }
    }).populate("rideId");

    if (!reservation) {
      return res.json(null);
    }

    res.json({
      reservationId: reservation._id,
      ride: reservation.rideId,
      expiresAt: reservation.expiresAt
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reservation" });
  }
};



module.exports.getCustomerPendingPayments = async (req, res) => {
  try {

    const userId = req.params.userId;

    // 1️⃣ Get active reservations
    const reservations = await RideReservation.find({
      expiresAt: { $gt: new Date() }
    });

    const reservedRideIds = reservations.map(r => r.rideId);

    // 2️⃣ Get rides of this customer that are reserved
    const rides = await Ride.find({
      customer_id: userId,
      status: "pending",
      _id: { $in: reservedRideIds }
    }).populate("driverId", "name phone");

    // 3️⃣ Attach reservationId
    const result = rides.map(ride => {
      const reservation = reservations.find(
        r => r.rideId.toString() === ride._id.toString()
      );

      return {
        ...ride._doc,
        reservationId: reservation ? reservation._id : null
      };
    });

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payment pending rides" });
  }
};