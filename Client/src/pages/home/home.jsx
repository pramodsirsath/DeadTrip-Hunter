// src/pages/Home.jsx
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">DeadTrip Hunter</h1>
          <nav className="space-x-6">
            <a href="/search" className="hover:text-blue-500">Search Loads</a>
            <a href="/post" className="hover:text-blue-500">Post Load</a>
            <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Login</a>
            <a href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Sign Up</a>
          </nav>
        </div>
      </header>

      {/* Hero Section: Left Text, Right Animation */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left Side - Text */}
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Eliminate Dead Trips. Maximize Profits.
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Find return loads easily and grow your trucking business with our smart load matching system.
            </p>
            <a
              href="/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg"
            >
              Get Started
            </a>
          </div>

          {/* Right Side - Lottie Animation */}
          <div
            className="md:w-1/2 w-full flex justify-center"
            dangerouslySetInnerHTML={{
              __html: `
                <dotlottie-player
                  src="https://lottie.host/46216999-6c7a-4b44-8c73-562d0267cfca/HLeToeInhs.json"
                  background="transparent"
                  speed="1"
                  style="width: 500px; height: 500px"
                  loop
                  autoplay
                ></dotlottie-player>
              `,
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Smart Matching</h3>
            <p>Automatically find return loads based on your forward trip routes and truck type.</p>
          </div>
          <div className="p-6 border rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Profit Calculator</h3>
            <p>Get estimates of fuel, tolls, and net profit for combined trips before accepting a load.</p>
          </div>
          <div className="p-6 border rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Real-Time Alerts</h3>
            <p>Receive instant notifications when a new return load is posted that fits your criteria.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} DeadTrip Hunter. All rights reserved.
      </footer>
    </div>
  );
}
