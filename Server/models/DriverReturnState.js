const mongoose = require("mongoose");

const DriverReturnStateSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    homeLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],   // [lng, lat]
        required: true
      }
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],   // [lng, lat]
        required: true
      }
    },

    // Best route as real highway LineString
    route: {
      type: {
        type: String,
        enum: ["Feature"],
        required: true
      },
      geometry: {
        type: {
          type: String,
          enum: ["LineString"],
          required: true
        },
        coordinates: {
          type: [[Number]], // [lng, lat]
          required: true
        }
      }
    },

    // 50 km corridor polygon around highway
    corridor: {
      type: {
        type: String,
        enum: ["Feature"],
        default: "Feature"
      },
      geometry: {
        type: {
          type: String,
          enum: ["Polygon", "MultiPolygon"],
          required: true
        },
        coordinates: {
          type: [[[Number]]],
          required: true
        }
      },
      properties: {
        bufferKm: {
          type: Number,
          default: 50
        }
      }
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: "6h"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DriverReturnState", DriverReturnStateSchema);
