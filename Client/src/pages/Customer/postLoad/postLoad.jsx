import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { jwtDecode } from "jwt-decode";

// Custom marker
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to handle clicks on map
function LocationPicker({ setCoords }) {
  useMapEvents({
    click(e) {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function PostLoad() {
  const [form, setForm] = useState({
    source: { lat: "", lng: "" },
    destination: { lat: "", lng: "" },
    date: "",
    truckType: "",
    loadDetails: "",
    weight: "",
    fare: "", // ✅ Added fare
  });

  const [selecting, setSelecting] = useState(null); // "source" | "destination" | null

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to post a load!");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded?.id;

      const payload = { ...form, customer_id: userId };

      const res = await fetch("http://localhost:3000/rides/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const loadData = await res.json();
      if (!res.ok) {
        alert("Failed to post load: " + loadData.message);
        return;
      }

      alert("✅ Load posted successfully!");
      console.log("Load posted successfully:", loadData);

      setForm({
        source: { lat: "", lng: "" },
        destination: { lat: "", lng: "" },
        date: "",
        truckType: "",
        loadDetails: "",
        weight: "",
        fare: "", // reset fare
      });
    } catch (err) {
      console.error("Error posting load:", err);
      alert("Something went wrong while posting the load.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Post a Load
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          {/* Source Selection */}
          <div>
            <button
              type="button"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => setSelecting("source")}
            >
              Select Source on Map
            </button>
            {form.source.lat && (
              <p className="text-sm text-gray-600 mt-1">
                📍 Source: {form.source.lat}, {form.source.lng}
              </p>
            )}
          </div>

          {/* Destination Selection */}
          <div>
            <button
              type="button"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => setSelecting("destination")}
            >
              Select Destination on Map
            </button>
            {form.destination.lat && (
              <p className="text-sm text-gray-600 mt-1">
                📍 Destination: {form.destination.lat}, {form.destination.lng}
              </p>
            )}
          </div>

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

          {/* ✅ Fare Field */}
          <input
            type="number"
            name="fare"
            placeholder="Fare (in ₹)"
            value={form.fare}
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

      {/* Map Modal */}
      {selecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-[100%] h-[100%] relative">
            <h3 className="text-lg font-semibold mb-2">
              Select {selecting === "source" ? "Source" : "Destination"} Location
            </h3>
            <MapContainer
              center={[20.5937, 78.9629]} // India center
              zoom={5}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              />
              <LocationPicker
                setCoords={(coords) =>
                  setForm((prev) => ({
                    ...prev,
                    [selecting]: coords,
                  }))
                }
              />
              {form[selecting].lat && (
                <Marker
                  position={[form[selecting].lat, form[selecting].lng]}
                  icon={markerIcon}
                />
              )}
            </MapContainer>

            <button
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => setSelecting(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
