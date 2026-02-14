const axios = require("axios");

async function getHighWayRoute(driver, home) {
  const key = process.env.GRAPHHOPPER_API_KEY;
  const url = `https://graphhopper.com/api/1/route?key=${key}`;

  // 1️⃣ Extract coordinates
  const body = {
    points: [
      [driver.lng, driver.lat],
      [home.lng, home.lat]
    ],
    vehicle: "car",
    points_encoded: false
  };

  console.log("Sending to GraphHopper:", JSON.stringify(body, null, 2));

  try {
    const res = await axios({
      method: "post",
      url,
      data: body,                     // <-- IMPORTANT
      headers: {
        "Content-Type": "application/json"
      }
    });

    const path = res.data.paths[0];

    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: path.points.coordinates
      }
    };
  } catch (err) {
    console.error(
      "GraphHopper error:",
      err.response?.data || err.message
    );
    throw new Error("Failed to fetch route from GraphHopper");
  }
}

module.exports = { getHighWayRoute };
