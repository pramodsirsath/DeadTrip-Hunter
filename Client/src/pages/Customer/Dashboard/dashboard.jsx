import React from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useLocation,useNavigate } from "react-router-dom";

export default function CustomerDashboard() {


const location = useLocation();
const navigate = useNavigate();
const [paymentStatus, setPaymentStatus] = useState(null);


useEffect(() => {
  const params = new URLSearchParams(location.search);
  const status = params.get("payment");

  if (status === "success") {
    setPaymentStatus("success");

    // remove query param after 3 seconds
    setTimeout(() => {
      navigate("/customer/dashboard", { replace: true });
    }, 3000);
  }

  if (status === "failed") {
    setPaymentStatus("failed");

    setTimeout(() => {
      navigate("/customer/dashboard", { replace: true });
    }, 3000);
  }

}, [location, navigate]);
const [pendingPayments, setPendingPayments] = useState([]);
      const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        const userId = decoded.id;
  const fetchPendingPayments = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/reservation/customer-pending/${userId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
}
      );

      const data = await res.json();
      setPendingPayments(data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
    const interval = setInterval(fetchPendingPayments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePayment = async (reservationId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/payment/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reservationId })
      });

      const data = await res.json();
      window.location.href = data.url;

    } catch (err) {
      console.error(err);
    }
  };

{pendingPayments.length === 0 && (
  <p>No pending payments</p>
)}



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
      {paymentStatus === "success" && (
  <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-4">
    ✅ Payment Successful! Your ride is confirmed.
  </div>
)}

{paymentStatus === "failed" && (
  <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
    ❌ Payment Failed. Please try again.
  </div>
)}
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
        <div className="mt-8">

      

      {pendingPayments.length!=0 && (
        <div>
        <h2 className="text-xl font-bold mb-4">
        Payment Pending
      </h2>
        <table className="min-w-full border">
        <thead>
          <tr className="bg-yellow-200">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Pickup</th>
            <th className="px-4 py-2">Drop</th>
            <th className="px-4 py-2">Fare</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {pendingPayments.map((ride, idx) => (
            <tr key={ride._id} className="border-b bg-yellow-50">
              <td className="px-4 py-2">{idx + 1}</td>
             <td className="px-4 py-2">
                        {addresses[ride._id]?.pickup || "Loading..."}
                      </td>
                      <td className="px-4 py-2">
                        {addresses[ride._id]?.drop || "Loading..."}
                      </td>

              
              <td className="px-4 py-2">₹{ride.fare}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handlePayment(ride.reservationId)}
                  className="bg-green-600 text-white px-4 py-1 rounded"
                >
                  Pay Now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>)}

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
