import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import axios from "axios";

export const generateFCMToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: "BIywdvU3_DPW5MBhC7JuhhfGvlciwYzX7qAfElbD7oKZeALdv4-Kwt_5RWo_CQdyy9tlbHvB46leUn1lHZyzlL0"
  });

  // send token to backend
await axios.post(
  "http://localhost:3000/auth/save-fcm-token",
  { token: token },
  { withCredentials: true }
);


  console.log("FCM TOKEN:", token);
};
