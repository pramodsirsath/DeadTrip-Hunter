// locationService.js
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL);
let watchId = null;

export const startDriverLocation = (acceptedRides) => {
  if (!("geolocation" in navigator)) return console.error("Geolocation not supported");

  // Stop previous watch if exists
  if (watchId) navigator.geolocation.clearWatch(watchId);

  watchId = navigator.geolocation.watchPosition(
    ({ coords }) => {
      const { latitude, longitude } = coords;
      console.log("📡 Sending driver location:", { latitude, longitude });

      acceptedRides.forEach((ride) => {
        socket.emit("driverLocation", {
          rideId: ride._id,
          coordinates: [longitude, latitude],
        });
      });
    },
    (err) => console.error("Geolocation error:", err),
    { enableHighAccuracy: true, maximumAge: 0, distanceFilter: 1 }
  );
};

export const stopDriverLocation = () => {
  if (watchId) navigator.geolocation.clearWatch(watchId);
};
