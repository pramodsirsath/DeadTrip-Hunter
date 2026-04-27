const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  stripeWebhook,
  withdrawFunds,
  getWithdrawalHistory
} = require("../controllers/paymentController");

// Create checkout session
router.post("/create-session", createCheckoutSession);
router.post("/verify-session", require("../controllers/paymentController").verifySession);

// Withdrawal routes
router.post("/withdraw", withdrawFunds);
router.get("/withdrawals/:driverId", getWithdrawalHistory);

// Stripe webhook (IMPORTANT: raw body required)


module.exports = router;