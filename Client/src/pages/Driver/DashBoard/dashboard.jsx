import React, { use } from 'react';
import { Bell, Truck, FileText, BarChart2, Settings } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import { set } from 'mongoose';


export default function DriverDashboard() {
  const navigate = useNavigate();
  const [user,setUser]=useState([]);
  // Fetch user data from localStorage or API
  useEffect(() => {
    fetch("http://localhost:3000/auth/me", {
      method:"GET",
      credentials: "include",

    })
    .then((res)=>{
      return res.json()
    })
    .then((data)=>setUser(data.user))
    .catch((err)=>{
      console.error("Error fetching user data:", err);
    });
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  }

  // Function to handle accepting a load
  const handleAccept = (loadId) => {
  if (!user?._id) {
    alert("User ID not found. Please re-login.");
    return;
  }

  fetch(`http://localhost:3000/loads/accept/${loadId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: user._id })
  })
  .then(async (res) => {
    const data = await res.json();
    if (res.ok) {
      alert("Load accepted successfully!");
    } else {
      alert("Failed to accept load: " + (data.message || data.error));
    }
  })
  .catch((err) => {
    console.error("Error accepting load:", err);
  });
};


  const [loads,setloads]=useState([]);
  // Fetch loads data from API
  useEffect(() => {
    fetch("http://localhost:3000/loads/driver-loads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user._id }) // Assuming user._id is the ID of the logged-in driver
    })
    .then((res) => res.json())
    .then((data) => setloads(data))
    .catch((err) => {
      console.error("Error fetching loads:", err);
    });
  }, [user._id]);


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Driver Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow">
          <Truck className="text-blue-500 mb-2" />
          <p className="text-sm text-gray-500">Trips Completed</p>
          <h2 className="text-xl font-semibold">18</h2>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow">
          <BarChart2 className="text-green-500 mb-2" />
          <p className="text-sm text-gray-500">Monthly Earnings</p>
          <h2 className="text-xl font-semibold">₹42,300</h2>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow">
          <FileText className="text-yellow-500 mb-2" />
          <p className="text-sm text-gray-500">Invoices</p>
          <h2 className="text-xl font-semibold">6 Pending</h2>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow">
          <Bell className="text-red-500 mb-2" />
          <p className="text-sm text-gray-500">New Alerts</p>
          <h2 className="text-xl font-semibold">3</h2>
        </div>
      </div>

      {/* Available Loads Section */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Available Loads</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left px-4 py-2">Source</th>
                <th className="text-left px-4 py-2">Destination</th>
                <th className="text-left px-4 py-2">Truck Type</th>
                {/* <th className="text-left px-4 py-2">Earnings</th> */}
                <th className="text-left px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load) => (
                <tr key={load._id}>
                  <td className="px-4 py-2">{load.source}</td>
                  <td className="px-4 py-2">{load.destination}</td>
                  <td className="px-4 py-2">{load.truckType}</td>
                  {/* <td className="px-4 py-2">₹{load.earnings}</td> */}
                  <td className="px-4 py-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={() => handleAccept(load._id)}>
                    Accept
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-bold mb-2">Recent Notifications</h2>
        <ul className="list-disc list-inside text-sm text-gray-700">
          <li>New return load matched from Nagpur to Pune</li>
          <li>Invoice #1234 is pending</li>
          <li>Fuel costs updated in profit calculator</li>
        </ul>
      </div>

      {/* Profile Settings */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          Driver Profile & Truck Info
        </h2>
        <p className="text-gray-600 text-sm mb-2">Name: {user.name}</p>
        <p className="text-gray-600 text-sm mb-2">Truck Number: {user.truckNumber}</p>
        <p className="text-gray-600 text-sm">Truck Type: {user.truckType}</p>
        <p><button onClick={handleLogout} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">LogOut</button></p>

      </div>
    </div>
  );
}
