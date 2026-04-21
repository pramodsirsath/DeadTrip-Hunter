const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  stripeWebhook
} = require("../controllers/paymentController");

// Create checkout session
router.post("/create-session", createCheckoutSession);
router.post("/verify-session", require("../controllers/paymentController").verifySession);

// Stripe webhook (IMPORTANT: raw body required)


module.exports = router;