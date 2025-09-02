import React from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function CustomerDashboard() {
  const [rides, setRides] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [addresses, setAddresses] = React.useState({}); // store {rideId: {pickup, drop}}

  const handleCancel = (rideId) => {
    // cancel ride API
    fetch(`http://localhost:3000/rides/${rideId}/cancel`, {
      method: 'PATCH',
    })
      .then(res => {
        if (res.ok) {
          setRides(rides.filter(ride => ride._id !== rideId));
          alert("Ride cancelled successfully!");
        } else {
          alert("Failed to cancel ride.");
        }
      })
      .catch(err => {
        console.error("Error cancelling ride:", err);
        alert("An error occurred while cancelling the ride.");
      });
  };

  // Helper: fetch address from lat/lng
const getAddress = async (lat, lng) => {
  try {
    const res = await fetch(
      `http://localhost:3000/rides/api/reverse-geocode?lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return (
      data.display_name ||
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      "Unknown"
    );
  } catch (err) {
    console.error("Error fetching address:", err);
    return "Error";
  }
};

  React.useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const res = await fetch(`http://localhost:3000/rides/user/${userId}`);
        const data = await res.json();
        setRides(data);

        // Convert coordinates into addresses
        const addressPromises = data.map(async (ride) => {
          const [srcLng, srcLat] = ride.source?.coordinates || [];
          const [destLng, destLat] = ride.destination?.coordinates || [];

          const pickup = srcLat && srcLng ? await getAddress(srcLat, srcLng) : "N/A";
          const drop = destLat && destLng ? await getAddress(destLat, destLng) : "N/A";

          return { rideId: ride._id, pickup, drop };
        });

        const resolvedAddresses = await Promise.all(addressPromises);
        const addrMap = {};
        resolvedAddresses.forEach(a => {
          addrMap[a.rideId] = { pickup: a.pickup, drop: a.drop };
        });
        setAddresses(addrMap);

      } catch (err) {
        console.error("Failed to load rides:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Customer Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/post-ride"
            className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700"
          >
            Post New Ride
          </Link>
          <Link
            to="/customer/profile"
            className="bg-white border p-4 rounded-lg text-center hover:shadow"
          >
            Manage Profile
          </Link>
          <Link
            to="/invoices"
            className="bg-white border p-4 rounded-lg text-center hover:shadow"
          >
            View Invoices
          </Link>
        </div>

        {/* Posted Rides Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Posted Rides</h2>

          {loading ? (
            <p>Loading...</p>
          ) : rides.length === 0 ? (
            <p>No rides posted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Pickup</th>
                    <th className="px-4 py-2">Drop</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Fare</th>
                    <th className="px-4 py-2">Action</th>
                    <th className="px-4 py-2">View</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((ride, idx) => (
                    <tr key={ride._id} className="border-b">
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">
                        {addresses[ride._id]?.pickup || "Loading..."}
                      </td>
                      <td className="px-4 py-2">
                        {addresses[ride._id]?.drop || "Loading..."}
                      </td>
                      <td className="px-4 py-2 capitalize">{ride.status}</td>
                      <td className="px-4 py-2">₹{ride.fare}</td>
                      <td className="px-4 py-2">
                        {ride.status === "pending" && (
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => handleCancel(ride._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {ride.status === "accepted" || ride.status === "ongoing" ? (
                          <Link
                            to={`/track/${ride._id}`}
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
