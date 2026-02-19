import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import axios from "axios";

export const generateFCMToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_vapidKey
  });

  // send token to backend
await axios.post(
  "http://localhost:3000/auth/save-fcm-token",
  { token: token },
  { withCredentials: true }
);


  console.log("FCM TOKEN:", token);
};
