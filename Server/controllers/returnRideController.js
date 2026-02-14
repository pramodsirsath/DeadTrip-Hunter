const DriverReturnState = require("../models/DriverReturnState");
const { getHighWayRoute } = require("../services/routeService");

const { createCorridor, isRideInsideCorridor ,checkDirectionToHome} = require("../services/corridorService");

const {point} = require("@turf/helpers");  

exports.startReturnMode = async (req, res) => {
  console.log("Body received:", req.body);

  try {
    let { driverLat, driverLng, homeLat, homeLng } = req.body;
    const driverId = req.user._id;

    // ✅ IMPORTANT FIX: ensure numbers, not strings
    driverLat = parseFloat(driverLat);
    driverLng = parseFloat(driverLng);
    homeLat = parseFloat(homeLat);
    homeLng = parseFloat(homeLng);

    // Safety check
    if (
      isNaN(driverLat) ||
      isNaN(driverLng) ||
      isNaN(homeLat) ||
      isNaN(homeLng)
    ) {
      return res.status(400).json({
        error: "Invalid coordinates. Must be numbers."
      });
    }

    // Get real highway route
    const route = await getHighWayRoute(
      { lat: driverLat, lng: driverLng },
      { lat: homeLat, lng: homeLng }
    );

    // Create 70 km corridor
    const corridor = createCorridor(route, 50);

    const state = await DriverReturnState.findOneAndUpdate(
      { driverId },
      {
        driverId,
        homeLocation: {
          type: "Point",
          coordinates: [homeLng, homeLat]
        },
        currentLocation: {
          type: "Point",
          coordinates: [driverLng, driverLat]
        },
        route,
        corridor
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Return mode activated", state });
  } catch (err) {
    console.error("startReturnMode error:", err.message);
    res.status(500).json({ error: err.message });
  }
};


exports.endReturnMode=async(req,res)=>{
  const driverId=req.user._id;
  try{
    console.log("Ending return mode for driver",driverId);
    await DriverReturnState.findOneAndDelete({driverId});

  }catch(err){
    console.error("Error ending return mode:",err);
    return res.status(500).json({error:"Failed to end return mode"});
  }
};

exports.filterRidesInCorridor = async (req, res) => {
  const driverId = req.user._id;
  const { rides } = req.body;

  const state = await DriverReturnState.findOne({ driverId });
  const homeLocation = state.homeLocation.coordinates;

  if (!state) {
    return res.status(400).json({ error: "Driver not in return mode" });
  }

  const validRides = rides.filter((ride, idx) => {

    // --- READ FROM YOUR ACTUAL STRUCTURE ---
    const [pLng, pLat] = ride.source.coordinates;
    const [dLng, dLat] = ride.destination.coordinates;

    // Safety check
    if (
      !Number.isFinite(pLng) ||
      !Number.isFinite(pLat) ||
      !Number.isFinite(dLng) ||
      !Number.isFinite(dLat)
    ) {
      console.warn(`Skipping bad ride at index ${idx}:`, ride._id);
      return false;
    }

    const pickupPoint = point([pLng, pLat]);
    const dropPoint = point([dLng, dLat]);

    const pickupInside = isRideInsideCorridor(pickupPoint, state.corridor);
    const dropInside = isRideInsideCorridor(dropPoint, state.corridor);

    const directionToHome = checkDirectionToHome(pickupPoint, dropPoint, homeLocation);

    return pickupInside && dropInside && directionToHome;
  });

  console.log("Filtered rides:", validRides.length);
  res.json({ validRides });
};

exports.checkMapdata = async (req, res) => {
  const driverId = req.user._id;
  console.log("Checking driver return status", driverId);
  try {
    const state = await DriverReturnState.findOne({ driverId });

    if (!state) {
      return res.status(400).json({ error: "Driver not in return mode" });
    }
    return res.json({
      currentLocation: state.currentLocation,
      homeLocation: state.homeLocation,
      route: state.route,
      corridor: state.corridor
    });
  } catch (err) {
    console.error("Error fetching return mode status:", err);
    return res.status(500).json({ error: "Failed to fetch return mode status" });
  }
};