const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null until a driver accepts
    },
    source: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    destination: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    date: {
      type: Date,
      required: true,
    },
    truckType: {
      type: String,
      enum: ["Container", "Open", "Trailer"],
      required: true,
    },
    weight: {
      type: String,
      required: true, // e.g. "10 tons"
    },
    loadDetails: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    acceptedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// ✅ Correct geospatial indexes
rideSchema.index({ source: "2dsphere" });
rideSchema.index({ destination: "2dsphere" });

const Ride = mongoose.model("Ride", rideSchema);
module.exports = Ride;
