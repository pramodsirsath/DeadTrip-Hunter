import { useState } from "react";
import HomeLocationMap from "../HomeLocationMap/HomeLocationMap";
import { getCurrentLocation } from "../../../utils/getCurrentLocation";

export default function ReturnModeToggle({ isReturnMode, setIsReturnMode }) {
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);


  const enableReturnMode = () => {
    setShowMap(true);
  };

  // ✅ NEW CORRECT FUNCTION (matches your backend)
  const confirmHomeLocation = async (home) => {
  try {
    setLoading(true);

    const current = await getCurrentLocation();

    await fetch("http://localhost:3000/return/rides/start", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        driverLat: current.lat,
        driverLng: current.lng,
        homeLat: home.lat,
        homeLng: home.lng
      })
    });

    setIsReturnMode(true);
    setShowMap(false);

  } catch (err) {
    console.error(err);
    alert("Failed to start return mode");
  } finally {
    setLoading(false);
  }
};


  const disableReturnMode = async () => {
    setIsReturnMode(false);
    await fetch("http://localhost:3000/return/rides/end", {
      method: "DELETE",
      credentials: "include"
    });

  };

  return (
    <>
      <button
        onClick={isReturnMode ? disableReturnMode : enableReturnMode}
        className={`px-4 py-2 rounded text-white ${
          isReturnMode ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {isReturnMode ? "Exit Return Mode" : "Enter Return Mode"}
      </button>

      {showMap && (
        <HomeLocationMap
  onConfirm={confirmHomeLocation}
  onCancel={() => !loading && setShowMap(false)}
  loading={loading}
/>

      )}
    </>
  );
}
