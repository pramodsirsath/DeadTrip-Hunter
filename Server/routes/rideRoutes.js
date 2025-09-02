const express = require("express");
const router = express.Router();

const rideController = require("../controllers/rideController");

// ✅ Customer creates a new ride request
router.post("/create", rideController.createRide);

// ✅ Get all rides for a specific user (customer or driver)
router.get("/user/:userId", rideController.getUserRides);

// ✅ Cancel a ride (only if pending, customer only)
router.patch("/:rideId/cancel", rideController.cancelRide);

// ✅ Driver sees all pending rides
router.get("/pending", rideController.getPendingRides);
router.get("/accepted/:driverId", rideController.getAcceptedRides);

// ✅ Driver accepts a ride
router.patch("/:id/accept", rideController.acceptRide);
router.get("/:rideId", rideController.getRideById);

// Proxy to Nominatim

router.get("/api/reverse-geocode",rideController.getAddressFromCoordinates);


module.exports = router;
