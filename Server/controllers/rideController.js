const Ride = require('../models/ride');
const User = require('../models/user');
const { sendCustomerEmail } = require('../services/email.service');

// ✅ Create Ride (customer posts a load)
const sendNotification = require("../utils/sendNotification");



module.exports.createRide = async (req, res) => {
  try {
    const { customer_id, source, destination, truckType, weight, loadDetails, date, fare } = req.body;

    if (!customer_id || !source || !destination || !truckType || !weight || !loadDetails || !date) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Convert frontend { lat, lng } into GeoJSON [lng, lat]
    const newRide = await Ride.create({
      customer_id,
      source: {
        type: "Point",
        coordinates: [source.lng, source.lat],
      },
      destination: {
        type: "Point",
        coordinates: [destination.lng, destination.lat],
      },
      truckType,
      weight,
      loadDetails,
      fare: fare || 0,
      date,
      status: "pending",
    });
    const drivers = await User.find({
      role: "driver",
      location: {
        $near: {
          $geometry: newRide.source,
          $maxDistance: 50000
        }
      }
    });

    const tokens = drivers.flatMap(d => d.fcmTokens);
    console.log("DRIVERS FOUND:", drivers.length);
console.log("TOKENS:", tokens);


    await sendNotification(tokens, newRide);

    res.status(201).json({
      message: "Ride created successfully",
      ride: newRide,
    });
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



// ✅ Get all rides for a customer/driver
module.exports.getUserRides = async (req, res) => {
  try {
    const userId = req.params.userId;  // ✅ use params, not query

    const rides = await Ride.find({
      $or: [{ customer_id: userId }, { driverId: userId }],
    }).populate("customer_id driverId", "name email phone");

    res.json(rides);
  } catch (error) {
    console.error("Error fetching user rides:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ Cancel a ride (only customer can cancel if pending)
module.exports.cancelRide = async (req, res) => {
  try {
    const rideId = req.params.rideId;
    const ride = await Ride.findById(rideId);

    if (!ride) return res.status(404).json({ error: "Ride not found" });
    if (ride.status !== "pending") {
      return res.status(400).json({ error: "Only pending rides can be cancelled" });
    }

    ride.status = "cancelled";
    await ride.save();

    res.status(200).json({ message: "Ride cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling ride:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ List pending rides (for drivers to accept)
module.exports.getPendingRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: "pending" }).populate("customer_id", "name phone");
    res.status(200).json(rides);
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.getFilterPendingRides = async (req, res) => {
  try {

    const { lat, lng } = req.body;

    const rides = await Ride.find({
      status: "pending",
      source: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat] // IMPORTANT lng first
          },
          $maxDistance: 50000 // 50km in meters
        }
      }
    });

    res.json(rides);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch nearby rides" });
  }
};

module.exports.getAcceptedRides = async (req, res) => {
  try {
    const { driverId } = req.params; // ✅ driverId from URL params

    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required" });
    }

    const rides = await Ride.find({ driverId, status: "accepted" })
      .populate("customer_id"); // ✅ Get customer details

    res.status(200).json(rides);
  } catch (error) {
    console.error("Error fetching accepted rides:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ Accept Ride (driver accepts customer's load)

const getAddress = async (lat, lng) => {
  try {
    const res = await fetch(
      `http://localhost:3000/rides/api/reverse-geocode?lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return (
      data.display_name ||
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      "Unknown"
    );
  } catch (err) {
    console.error("Error fetching address:", err);
    return "Error";
  }
};
module.exports.acceptRide = async (req, res) => {
  try {
    const rideId = req.params.id;
    const driverId = req.body.driverId;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });
    if (ride.status !== "pending") {
      return res.status(400).json({ error: "Ride already accepted or closed" });
    }

    const driver = await User.findById(driverId);
    const customer = await User.findById(ride.customer_id);

    if (!driver) return res.status(404).json({ error: "Driver not found" });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    // ✅ Update ride
    ride.driverId = driverId;
    ride.status = "accepted";
    ride.acceptedAt = new Date();
    await ride.save();

    // ✅ Notify customer via email

    const [srcLng, srcLat] = ride.source?.coordinates || [];
    const [destLng, destLat] = ride.destination?.coordinates || [];

    const source = srcLat && srcLng ? await getAddress(srcLat, srcLng) : "N/A";
    const destination = destLat && destLng ? await getAddress(destLat, destLng) : "N/A";

    await sendCustomerEmail(
      customer.email,
      customer.name,
      {
        driverName: driver.name,
        phone: driver.phone,
        truckType: ride.truckType,
        vehicleNumber: driver.truckNumber || 'N/A',
      },
      {
        source: source,
        destination: destination,
        weight: ride.weight,
        date: ride.acceptedAt,
      }
    );

    res.status(200).json({ message: "Ride accepted successfully", ride });
  } catch (error) {
    console.error("Error accepting ride:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// get ride by ID (for tracking)
module.exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    res.json(ride);
  } catch (err) {
    console.error("❌ Error fetching ride:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.getAddressFromCoordinates = async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();
    res.json(data); // send response to frontend
  } catch (error) {
    console.error("Geocoding error:", error);
    res.status(500).json({ error: "Failed to fetch address" });
  }
};
