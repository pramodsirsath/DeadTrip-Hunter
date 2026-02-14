import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    }
  });
  return null;
}

export default function HomeLocationMap({ onConfirm, onCancel, loading }) {
  const [homeLocation, setHomeLocation] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">

      <div className="bg-white w-[90%] h-[85%] rounded-xl p-4 relative shadow-2xl">

        <h2 className="text-lg font-bold mb-3">Select Home Location</h2>

        {/* MAP CONTAINER */}
        <div className="relative h-[75%] w-full rounded-lg overflow-hidden">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <LocationPicker onPick={setHomeLocation} />

            {homeLocation && (
              <Marker position={[homeLocation.lat, homeLocation.lng]} />
            )}
          </MapContainer>

          {/* 🔥 Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white px-8 py-5 rounded-2xl shadow-2xl text-center animate-pulse">
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg font-semibold text-gray-800">
                    Calculating return corridor...
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Finding rides along your way home
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => onConfirm(homeLocation)}
            disabled={!homeLocation || loading}
            className={`px-5 py-2 rounded text-white transition ${
              !homeLocation || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Starting..." : "Confirm Home Location"}
          </button>

          <button
            onClick={onCancel}
            disabled={loading}
            className={`px-5 py-2 rounded transition ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
