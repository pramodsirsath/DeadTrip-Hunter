import React from 'react';
import { Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

export default function CustomerDashboard() {

  const [loads, setLoads] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const handleCancel = (loadId) => {
    // Handle load cancellation logic here
    console.log("Cancelling load:", loadId);
    // You can make an API call to cancel the load
    fetch(`http://localhost:3000/loads/cancel/${loadId}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok) {
          setLoads(loads.filter(load => load._id !== loadId));
          alert("Load cancelled successfully!");
        } else {
          alert("Failed to cancel load.");
        }
      })
      .catch(err => {
        console.error("Error cancelling load:", err);
        alert("An error occurred while cancelling the load.");
      });
  }

  React.useEffect(() => {
    const fetchLoads = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const res = await fetch(`http://localhost:3000/loads/getloads?userId=${userId}`);
        const data = await res.json();
        setLoads(data);
      } catch (err) {
        console.error("Failed to load posted loads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoads();
  },[]);
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Heading */}
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Customer Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/post-load"
            className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700"
          >
            Post New Load
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

        {/* Posted Loads Table (static data for now) */}
         <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">My Posted Loads</h2>

      {loading ? (
        <p>Loading...</p>
      ) : loads.length === 0 ? (
        <p>No loads posted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Route</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Truck Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load, idx) => (
                <tr key={load._id} className="border-b">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{load.source} → {load.destination}</td>
                  <td className="px-4 py-2">{new Date(load.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{load.truckType}</td>
                  <td className="px-4 py-2 capitalize">{load.status}</td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:underline" onClick={() => handleCancel(load._id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

        {/* Notifications Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">Latest Notifications</h3>
          <ul className="list-disc ml-5 text-sm text-yellow-700">
            <li>New truck matched with Load #102</li>
            <li>No return load found for Load #98. Check suggested hubs.</li>
            <li>Your invoice for Load #95 is ready for download.</li>
          </ul>
        </div>

        {/* Analytics Overview */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Shipment Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-100 p-4 rounded text-center">
              <h3 className="text-2xl font-bold">12</h3>
              <p className="text-sm">Total Loads</p>
            </div>
            <div className="bg-green-100 p-4 rounded text-center">
              <h3 className="text-2xl font-bold">8</h3>
              <p className="text-sm">Completed</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded text-center">
              <h3 className="text-2xl font-bold">2</h3>
              <p className="text-sm">Pending</p>
            </div>
            <div className="bg-red-100 p-4 rounded text-center">
              <h3 className="text-2xl font-bold">2</h3>
              <p className="text-sm">Cancelled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
