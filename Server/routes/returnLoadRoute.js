const express = require("express");
const { startReturnMode,endReturnMode, filterRidesInCorridor,checkMapdata } = require("../controllers/returnRideController");
const { isAuthenticated } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/rides/start", isAuthenticated, startReturnMode);
router.post("/rides/return-rides", isAuthenticated, filterRidesInCorridor);
router.delete("/rides/end", isAuthenticated, endReturnMode);
router.get("/rides/status", isAuthenticated, checkMapdata );
module.exports = router;
