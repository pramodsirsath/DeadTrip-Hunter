const express = require("express");
const router = express.Router();
const axios = require("axios");
const formatGoogleAddress = require("../utils/formatAddress");

router.get("/reverse", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ address: "Unknown location" });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAP}`;

    const response = await axios.get(url);
    const data = response.data;

    if (data.results && data.results.length > 0) {
      // Get the formatted address
      const formatted = formatGoogleAddress(data.results[0].address_components);
      res.json({ address: formatted });
    } else {
      res.json({ address: "Unknown location" });
    }
  } catch (err) {
    console.error("Reverse geo error:", err.message);
    res.json({ address: "Unknown location" });
  }
});

module.exports = router;
