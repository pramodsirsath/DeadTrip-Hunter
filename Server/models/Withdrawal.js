const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    upiId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "processing", // Mocking as processing right away
    },
    transactionId: {
      type: String,
      default: function() {
        // Generate a random mock transaction ID
        return 'TXN' + Math.floor(Math.random() * 1000000000000);
      }
    }
  },
  {
    timestamps: true,
  }
);

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
module.exports = Withdrawal;
