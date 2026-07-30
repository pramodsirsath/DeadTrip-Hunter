const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");

// Assuming you have an auth middleware, you might want to protect these routes
// const { protect } = require("../middlewares/authMiddleware");

router.post("/", feedbackController.submitFeedback);
router.get("/", feedbackController.getFeedback);

module.exports = router;
