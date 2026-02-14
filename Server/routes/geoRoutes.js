const express = require("express");
const router = express.Router();

router.get("/reverse", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ address: "Unknown location" });
    }

    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "DeadTrip-Hunter/1.0"
      }
    });

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();
    const a = data.address || {};

    const formatted = [
      a.subdistrict || a.tehsil || a.village || a.town,
      a.district || a.county,
      a.state
    ]
      .filter(Boolean)
      .join(", ");

    res.json({ address: formatted || "Unknown location" });
  } catch (err) {
    console.error("Reverse geo error:", err.message);
    res.json({ address: "Unknown location" });
  }
});

module.exports = router;
