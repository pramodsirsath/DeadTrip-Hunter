const Ride = require('../models/ride');
const User = require('../models/user');
const RideReservation = require("../models/RideReservation");
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


module.exports.getUserRides = async (req, res) => {
  try {

    const userId = req.params.userId;

    // 1️⃣ Get active reservations
    const activeReservations = await RideReservation.find({
      expiresAt: { $gt: new Date() }
    }).select("rideId");

    const reservedRideIds = activeReservations.map(r => r.rideId);

    // 2️⃣ Get rides excluding reserved ones
    const rides = await Ride.find({
      $or: [
        { customer_id: userId },
        { driverId: userId }
      ],
      _id: { $nin: reservedRideIds }
    }).populate("customer_id driverId", "name email phone");

    res.json(rides);

  } catch (error) {
    console.error("Error fetching user rides:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ Cancel a ride (Customer cancels)
module.exports.cancelRide = async (req, res) => {
  try {
    const rideId = req.params.rideId;
    const ride = await Ride.findById(rideId);

    if (!ride) return res.status(404).json({ error: "Ride not found" });

    // Pending rides can be cancelled easily (no money involved)
    if (ride.status === "pending") {
      ride.status = "cancelled";
      ride.cancelledBy = "customer";
      ride.cancellationReason = req.body?.reason || "Customer cancelled before acceptance";
      await ride.save();
      return res.status(200).json({ message: "Ride cancelled successfully", refundAmount: 0 });
    }

    // If accepted or in_progress, apply time-based rules
    if (ride.status === "accepted" || ride.status === "in_progress") {
      let refundPct = 0;
      let driverPct = 0;

      if (ride.status === "in_progress") {
        // After ride started -> 100% driver
        refundPct = 0;
        driverPct = 100;
      } else {
        // Ride is "accepted", check time difference
        const now = new Date();
        const diffInMinutes = (now - new Date(ride.acceptedAt)) / (1000 * 60);

        if (diffInMinutes <= 10) {
          refundPct = 90;
          driverPct = 10;
        } else if (diffInMinutes <= 20) {
          refundPct = 50;
          driverPct = 50;
        } else {
          // After 20 mins -> 100% driver
          refundPct = 0;
          driverPct = 100;
        }
      }

      const advance = ride.advancePaid || 0;
      const refundAmount = (advance * refundPct) / 100;
      const driverComp = (advance * driverPct) / 100;

      ride.status = "cancelled";
      ride.cancelledBy = "customer";
      ride.cancellationReason = req.body?.reason || "Customer cancelled";
      ride.refundAmount = refundAmount;
      ride.driverCompensation = driverComp;
      await ride.save();

      // Update wallets
      const customer = await User.findById(ride.customer_id);
      if (customer) {
        customer.walletBalance = (customer.walletBalance || 0) + refundAmount;
        await customer.save();
      }

      if (ride.driverId) {
        const driver = await User.findById(ride.driverId);
        if (driver) {
          driver.walletBalance = (driver.walletBalance || 0) + driverComp;
          await driver.save();
        }
      }

      return res.status(200).json({ 
        message: "Ride cancelled with time-based rules", 
        refundAmount, 
        driverCompensation: driverComp 
      });
    }

    return res.status(400).json({ error: "Ride cannot be cancelled at this stage" });

  } catch (error) {
    console.error("Error cancelling ride:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Start Ride (Driver picks up goods)
module.exports.startRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    if (ride.status !== "accepted") {
      return res.status(400).json({ error: "Only accepted rides can be started" });
    }

    if (ride.driverId.toString() !== driverId) {
      return res.status(403).json({ error: "Unauthorized driver" });
    }

    ride.status = "in_progress";
    ride.startedAt = new Date();
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    ride.completionOTP = otp;
    await ride.save();

    console.log(`[RIDE STARTED] Ride ID: ${rideId} | Completion OTP: ${otp}`);
    // Optionally notify customer here with the OTP (e.g., via SMS/Email)

    res.status(200).json({ message: "Ride started successfully", ride, otp });
  } catch (error) {
    console.error("Error starting ride:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Driver Cancels Ride
module.exports.driverCancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    if (ride.status !== "accepted" && ride.status !== "in_progress") {
      return res.status(400).json({ error: "Ride cannot be cancelled" });
    }

    if (ride.driverId.toString() !== driverId) {
      return res.status(403).json({ error: "Unauthorized driver" });
    }

    const advance = ride.advancePaid || 0;
    
    // 100% refund to customer
    ride.status = "cancelled";
    ride.cancelledBy = "driver";
    ride.cancellationReason = req.body.reason || "Driver cancelled";
    ride.refundAmount = advance;
    ride.driverCompensation = 0;
    await ride.save();

    // Refund customer
    const customer = await User.findById(ride.customer_id);
    if (customer) {
      customer.walletBalance = (customer.walletBalance || 0) + advance;
      await customer.save();
    }

    // Penalize driver
    const driver = await User.findById(driverId);
    if (driver) {
      driver.cancellationCount = (driver.cancellationCount || 0) + 1;
      await driver.save();
    }

    res.status(200).json({ message: "Ride cancelled by driver. Customer fully refunded.", refundAmount: advance });
  } catch (error) {
    console.error("Error in driver cancel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Complete Ride (Verification)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

module.exports.completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId, otp, location } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    if (ride.status !== "in_progress") {
      return res.status(400).json({ error: "Only in-progress rides can be completed" });
    }

    if (ride.driverId.toString() !== driverId) {
      return res.status(403).json({ error: "Unauthorized driver" });
    }

    // Verify OTP
    if (ride.completionOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Verify Location (must be within ~5km of destination)
    if (location && location.lat && location.lng) {
      const [destLng, destLat] = ride.destination.coordinates;
      const distance = calculateDistance(location.lat, location.lng, destLat, destLng);
      
      if (distance > 5) {
        return res.status(400).json({ error: "Driver is too far from the destination to complete the ride." });
      }
    } else {
      return res.status(400).json({ error: "Location coordinates required for verification" });
    }

    ride.status = "completed";
    ride.completedAt = new Date();
    await ride.save();

    // Settlement: Booking amount given to driver wallet
    const driver = await User.findById(driverId);
    if (driver) {
      driver.walletBalance = (driver.walletBalance || 0) + (ride.advancePaid || 0);
      await driver.save();
    }

    res.status(200).json({ message: "Ride completed successfully!" });
  } catch (error) {
    console.error("Error completing ride:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




module.exports.getPendingRides = async (req, res) => {
  try {

    // 1️⃣ Get active reservations
    const activeReservations = await RideReservation.find({
      expiresAt: { $gt: new Date() }
    }).select("rideId");

    const reservedRideIds = activeReservations.map(r => r.rideId);

    // 2️⃣ Fetch only pending rides NOT reserved
    const rides = await Ride.find({
      status: "pending",
      _id: { $nin: reservedRideIds }
    }).populate("customer_id", "name phone");

    res.status(200).json(rides);

  } catch (error) {
    console.error("Error fetching pending rides:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports.getFilterPendingRides = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    // 1️⃣ Get all active reservations
    const activeReservations = await RideReservation.find({
      expiresAt: { $gt: new Date() }
    }).select("rideId");

    // Extract ride IDs that are reserved
    const reservedRideIds = activeReservations.map(r => r.rideId);

    // 2️⃣ Find nearby rides that are NOT reserved
    const rides = await Ride.find({
      status: "pending",
      _id: { $nin: reservedRideIds }, // 🔥 exclude reserved rides
      source: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat] // lng first
          },
          $maxDistance: 50000
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

    const rides = await Ride.find({ 
      driverId, 
      status: { $in: ["accepted", "in_progress"] } 
    }).populate("customer_id"); // ✅ Get customer details

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
    if (!driver) return res.status(404).json({ error: "Driver not found" });

    // 🔒 Check if already reserved
    const existingReservation = await RideReservation.findOne({
      rideId,
      expiresAt: { $gt: new Date() }
    });

    if (existingReservation) {
      return res.status(400).json({ error: "Ride already reserved" });
    }

    // ✅ Create Reservation (10 min lock)
    const reservation = await RideReservation.create({
      rideId,
      driverId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    return res.json({
      message: "Ride reserved. Waiting for customer payment.",
      reservationId: reservation._id
    });

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
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "DeadtripHunter/1.0 (contact@deadtrip.com)"
        }
      }
    );
    const data = await response.json();
    
    if (data.address) {
      // Prioritize village/town/suburb/county for 'Taluka'
      const taluka = data.address.village || data.address.town || data.address.suburb || data.address.city || data.address.county || "";
      const district = data.address.state_district || data.address.county || "";
      const state = data.address.state || "";

      // Remove duplicates if taluka and district match
      const parts = [];
      if (taluka) parts.push(taluka);
      if (district && district !== taluka) parts.push(district);
      if (state && state !== district && state !== taluka) parts.push(state);

      data.display_name = parts.join(", ") || "Unknown Location";
    }

    res.json(data); // send response to frontend
  } catch (error) {
    console.error("Geocoding error:", error);
    res.status(500).json({ error: "Failed to fetch address" });
  }
};
