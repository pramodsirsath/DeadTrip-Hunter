import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';



export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [role, setRole] = useState('customer'); // or 'driver'
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 👉 You can replace this with actual API call


    const dataToSend = {
      email,
      password,

    }

    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
      credentials: "include",
    });
    const userdata = await res.json();
    if (res.ok) {
      alert("Login successful!");
      console.log(userdata.user.token);
      localStorage.setItem('token', userdata.token);
      localStorage.setItem('role', userdata.user.role); // Save role to localStorage
      let role = userdata.user.role; // Save token to localStorage
      if (role === 'driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/customer/dashboard');
      } // 👈 go to login page
    } else {

      alert(`Login failed: ${userdata.message || 'Unknown error'}`);
    }

   
    console.log(userdata);
  };
  // Example: redirect based on role after successful login



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Login to DeadTrip Hunter</h2>


        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-4 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border px-4 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
