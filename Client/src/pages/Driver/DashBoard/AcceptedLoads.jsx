import { useEffect } from "react";
import socket from "../../../socket";

const driverLocationMap = {};

export default function AcceptedLoads({ loads, onViewMap }) {

  const startDriverLocation = (rideId) => {
    if (!rideId || driverLocationMap[rideId]) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        socket.emit("driverLocation", {
          rideId,
          coordinates: [coords.longitude, coords.latitude]
        });
      },
      console.error,
      { enableHighAccuracy: true }
    );

    driverLocationMap[rideId] = watchId;
  };

  useEffect(() => {
    loads.forEach(ride => startDriverLocation(ride._id));
  }, [loads]);

  return (
    <div className="bg-white p-6 mt-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">My Accepted Rides</h2>

      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th>Source</th>
            <th>Destination</th>
            <th>Truck</th>
            <th>Map</th>
          </tr>
        </thead>
        <tbody>
          {loads.map(ride => (
            <tr key={ride._id}>
              <td>{ride.sourceAddress}</td>
              <td>{ride.destinationAddress}</td>
              <td>{ride.truckType}</td>
              <td>
                <button
                  onClick={() => onViewMap(ride._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  View Map
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
