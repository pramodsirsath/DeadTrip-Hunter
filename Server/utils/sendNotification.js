const admin = require("../config/firebase");

const sendNotification = async (tokens, ride) => {
  try {
    const response = await admin.messaging().sendEachForMulticast({
  tokens: tokens,
  data: {
    title: "New Load Nearby 🚚",
    body: "Load posted",
    url: "/driver/dashboard",
    sound: "default"
  }
  });

    console.log("FCM RESULT:", response);

  } catch (err) {
    console.log("FCM ERROR:", err);
  }
};

module.exports = sendNotification;
