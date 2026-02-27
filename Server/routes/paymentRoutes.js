const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  stripeWebhook
} = require("../controllers/paymentController");

// Create checkout session
router.post("/create-session", createCheckoutSession);

// Stripe webhook (IMPORTANT: raw body required)


module.exports = router;