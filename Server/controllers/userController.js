const User = require("../models/user");

exports.saveFCMToken = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    if (!req.user)
      return res.status(401).json({ message: "User not authenticated" });

    const userId = req.user.id;
    const { token } = req.body;

    if (!token)
      return res.status(400).json({ message: "Token missing" });

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { fcmTokens: token } },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "FCM token saved successfully" });

  } catch (err) {
    console.error("SAVE TOKEN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
