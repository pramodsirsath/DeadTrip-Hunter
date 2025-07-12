// src/pages/PostLoad.jsx
import React, { useState } from "react";
import {jwtDecode} from "jwt-decode";


export default function PostLoad() {
  const [form, setForm] = useState({
    source: "",
    destination: "",
    date: "",
    truckType: "",
    loadDetails: "",
    weight: "",
    status: "pending", // Default status
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Get user ID from JWT token
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userId = token ? jwtDecode(token).id : null;
    // console.log("User ID from token:", userId);

    const payload={
      ...form,
      userId: userId, // Ensure userId is included in the payload
    }
    const res = await fetch("http://localhost:3000/loads/customer-loads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    const loadData = await res.json();
    if (!res.ok) {
      alert("Failed to post load: " + loadData.message);
      return;
    }
    // TODO: Send data to backend API
    console.log("Submitting Load:", form);
    alert("Load posted successfully!");
    setForm({
      source: "",
      destination: "",
      date: "",
      truckType: "",
      loadDetails: "",
      weight: "",
    });
    console.log("Load posted successfully:", loadData);
    
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Post a Load</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input
            type="text"
            name="source"
            placeholder="Source Location"
            value={form.source}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="destination"
            placeholder="Destination Location"
            value={form.destination}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <select
            name="truckType"
            value={form.truckType}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Truck Type</option>
            <option value="Container">Container</option>
            <option value="Open">Open</option>
            <option value="Trailer">Trailer</option>
          </select>
          <input
            type="text"
            name="weight"
            placeholder="Weight (e.g., 10 tons)"
            value={form.weight}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <textarea
            name="loadDetails"
            placeholder="Load Details"
            value={form.loadDetails}
            onChange={handleChange}
            className="border p-2 rounded h-24"
            required
          ></textarea>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Post Load
          </button>
        </form>
      </div>
    </div>
  );
}
