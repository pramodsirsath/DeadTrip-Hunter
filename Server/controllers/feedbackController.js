const Feedback = require("../models/feedback");

exports.submitFeedback = async (req, res) => {
  try {
    const feedbackData = req.body;
    // Assuming req.user is set by auth middleware, if applicable
    if (req.user && req.user._id) {
      feedbackData.driverId = req.user._id;
    }

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting feedback",
      error: error.message,
    });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("driverId", "name phone")
      .populate("rideId");

    res.status(200).json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching feedback",
      error: error.message,
    });
  }
};
