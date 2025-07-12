import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function CustomerProfile() {
  const [user, setUser] = useState({});

useEffect(() => {
  fetch("http://localhost:3000/auth/me", {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    })
    .then((data) => {
      console.log(data); // for debugging
      setUser(data.user);
    })
    .catch((err) => {
      console.error("Error fetching user data:", err);
    });
}, []);


  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear token/cookie or user data
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Redirect to login
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Customer Profile</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold">Name:</label>
            <p className="text-gray-700">{user.name}</p>
          </div>
          <div>
            <label className="block font-semibold">Email:</label>
            <p className="text-gray-700">{user.email}</p>
          </div>
          <div>
            <label className="block font-semibold">Phone:</label>
            <p className="text-gray-700">{user.phone}</p>
          </div>
          <div>
            <label className="block font-semibold">Role:</label>
            <p className="text-gray-700">{user.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
