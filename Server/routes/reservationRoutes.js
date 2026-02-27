const express = require("express");
const router = express.Router();

const { getDriverActiveReservation } = require("../controllers/reservationController");
const {getCustomerPendingPayments} = require("../controllers/reservationController");
// If you have auth middleware
const { isAuthenticated } = require("../middlewares/auth.middleware");

// Driver reserves ride
router.get("/driver-active", isAuthenticated, getDriverActiveReservation);
router.get("/customer-pending/:userId", isAuthenticated,getCustomerPendingPayments);

module.exports = router;