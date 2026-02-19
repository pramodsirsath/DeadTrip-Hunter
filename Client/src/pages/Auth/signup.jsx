import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentLocation } from '../../utils/getCurrentLocation';

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    truckType: '',
    truckNumber: '',
    licenseNumber: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const location = await getCurrentLocation();

  const dataToSend={
    ...formData,
    role: role,
    location: {
      type: "Point",
      coordinates: [location.lng, location.lat]
    }
  }
  
  const res = await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSend),
  });
  if (res.ok) {
  alert("Signup successful!");
  navigate("/login"); // 👈 go to login page
}

  const data = await res.json();
  console.log(data);
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Signup as {role === 'driver' ? 'Driver' : 'Customer'}</h2>

        {/* Role Selector */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setRole('customer')}
            className={`px-4 py-2 rounded ${role === 'customer' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            I'm a Customer
          </button>
          <button
            onClick={() => setRole('driver')}
            className={`px-4 py-2 rounded ${role === 'driver' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            I'm a Driver
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />
          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          {/* Driver-specific fields */}
          {role === 'driver' && (
            <>
              <select
                name="truckType"
                value={formData.truckType}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              >
                <option value="">Select Truck Type</option>
                <option value="Container">Container</option>
                <option value="Open">Open</option>
                <option value="Trailer">Trailer</option>
              </select>
              <input
                name="truckNumber"
                placeholder="Truck Number"
                value={formData.truckNumber}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
              <input
                name="licenseNumber"
                placeholder="Driving License Number"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
