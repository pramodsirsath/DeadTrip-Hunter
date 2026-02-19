import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

export const listenNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log("FOREGROUND MESSAGE:", payload);

    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: "/driver-marker.png"
    });
  });
};
