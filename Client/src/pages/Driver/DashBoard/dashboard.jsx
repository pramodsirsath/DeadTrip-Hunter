import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Global socket
const driverLocationMap = {}; // Keep track of rides currently sending location

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [availableLoads, setAvailableLoads] = useState([]);
  const [acceptedLoads, setAcceptedLoads] = useState([]);

  // 🔹 Convert coordinates → full address
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      return data.display_name || "Unknown Address";
    } catch (err) {
      console.error("Geocoding error:", err);
      return "Unknown Address";
    }
  };

  // 🔹 Process rides to add source & destination addresses
  const processRides = async (rides) => {
    return Promise.all(
      rides.map(async (ride) => {
        const [srcLng, srcLat] = ride.source?.coordinates || [];
        const [destLng, destLat] = ride.destination?.coordinates || [];

        const sourceAddress =
          srcLat && srcLng ? await getAddressFromCoords(srcLat, srcLng) : "N/A";
        const destinationAddress =
          destLat && destLng
            ? await getAddressFromCoords(destLat, destLng)
            : "N/A";

        return { ...ride, sourceAddress, destinationAddress };
      })
    );
  };

  useEffect(() => {
    fetch("http://localhost:3000/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch((err) => console.error(err));
  }, []);

  const fetchAcceptedLoads = () => {
    if (!user?._id) return;
    fetch(`http://localhost:3000/rides/accepted/${user._id}`)
      .then((res) => res.json())
      .then(async (data) => {
        const processed = await processRides(data);
        setAcceptedLoads(processed);

        // Start sending location for all rides
        processed.forEach((ride) => startDriverLocation(ride._id));
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetch("http://localhost:3000/rides/pending")
      .then((res) => res.json())
      .then(async (data) => {
        const processed = await processRides(data);
        setAvailableLoads(processed);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (user?._id) fetchAcceptedLoads();
  }, [user?._id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Start sending driver location for a ride (if not already)
  const startDriverLocation = (rideId) => {
    if (!rideId || driverLocationMap[rideId]) return;

    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          console.log("📡 Sending driver location:", rideId, {
            latitude,
            longitude,
          });

          socket.emit("driverLocation", {
            rideId,
            coordinates: [longitude, latitude], // [lng, lat]
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 0, distanceFilter: 1 }
      );

      driverLocationMap[rideId] = watchId;
    } else {
      console.error("Geolocation not supported in this browser");
    }
  };

  const handleAccept = async (loadId) => {
    if (!user?._id) return alert("User not found");
    try {
      const res = await fetch(`http://localhost:3000/rides/${loadId}/accept`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: user._id }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("✅ Load accepted!");
        fetchAcceptedLoads();
        startDriverLocation(loadId);
      } else {
        alert("❌ Failed: " + (data.message || data.error));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewMap = (rideId) => {
    startDriverLocation(rideId);
    navigate(`/track/${rideId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Driver Dashboard
      </h1>

      {/* Available Loads */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Available Loads</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th>Source</th>
              <th>Destination</th>
              <th>Truck</th>
              <th>Date</th>
              <th>Weight</th>
              <th>Details</th>
              <th>Fare</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availableLoads.map((load) => (
              <tr key={load._id}>
                <td>{load.sourceAddress}</td>
                <td>{load.destinationAddress}</td>
                <td>{load.truckType}</td>
                <td>{new Date(load.date).toLocaleDateString()}</td>
                <td>{load.weight}</td>
                <td>{load.loadDetails}</td>
                <td>₹{load.fare}</td>
                <td>
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => handleAccept(load._id)}
                  >
                    Accept
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Accepted Loads */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-4">My Accepted Loads</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th>Customer</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Truck</th>
              <th>Date</th>
              <th>Weight</th>
              <th>Details</th>
              <th>Fare</th>
              <th>View Map</th>
            </tr>
          </thead>
          <tbody>
            {acceptedLoads.map((load) => (
              <tr key={load._id}>
                <td>{load.customer?.name || "Unknown"}</td>
                <td>{load.sourceAddress}</td>
                <td>{load.destinationAddress}</td>
                <td>{load.truckType}</td>
                <td>{new Date(load.date).toLocaleDateString()}</td>
                <td>{load.weight}</td>
                <td>{load.loadDetails}</td>
                <td>₹{load.fare}</td>
                <td>
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => handleViewMap(load._id)}
                  >
                    View Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
