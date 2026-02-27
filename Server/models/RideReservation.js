const mongoose = require("mongoose");

const RideReservationSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  paymentSessionId: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("RideReservation", RideReservationSchema);