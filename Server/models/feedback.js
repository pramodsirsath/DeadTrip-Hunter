const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    ride_distance: {
      type: Number,
      required: true,
    },
    truck_type: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    fuel_consumed: {
      type: Number,
      required: true,
    },
    fuel_price: {
      type: Number,
      required: true,
    },
    vehicle_mileage: {
      type: Number,
      required: true,
    },
    toll_charges: {
      type: Number,
      required: true,
    },
    other_expenses: {
      type: Number,
      default: 0,
    },
    net_profit: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
