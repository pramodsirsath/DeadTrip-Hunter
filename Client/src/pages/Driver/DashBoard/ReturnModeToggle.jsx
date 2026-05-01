import { useState } from "react";
import HomeLocationMap from "../HomeLocationMap/HomeLocationMap";
import { getCurrentLocation } from "../../../utils/getCurrentLocation";
import { RotateCcw, Home, Power } from 'lucide-react';

export default function ReturnModeToggle({ isReturnMode, setIsReturnMode }) {
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);


  const enableReturnMode = () => {
    setShowMap(true);
  };

  const confirmHomeLocation = async (home) => {
    try {
      setLoading(true);

      const current = await getCurrentLocation();

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/return/rides/start`, {
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
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/return/rides/end`, {
      method: "DELETE",
      credentials: "include"
    });
  };

  return (
    <>
      {/* Toggle Switch */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        <button
          onClick={isReturnMode ? disableReturnMode : enableReturnMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 24px',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.9rem',
            transition: 'all var(--transition-base)',
            background: isReturnMode
              ? 'var(--danger-soft)'
              : 'var(--success-soft)',
            color: isReturnMode ? 'var(--danger)' : 'var(--success)',
            boxShadow: isReturnMode
              ? '0 0 16px rgba(239,68,68,0.15)'
              : '0 0 16px rgba(16,185,129,0.15)',
          }}
        >
          {isReturnMode ? (
            <>
              <Power size={18} />
              Exit Return Mode
            </>
          ) : (
            <>
              <Home size={18} />
              Enter Return Mode
            </>
          )}
        </button>

        {isReturnMode && (
          <span className="badge badge-active animate-fadeIn" style={{
            padding: '6px 14px',
            fontSize: '0.8rem',
          }}>
            <span className="dot"></span>
            Return Mode Active
          </span>
        )}
      </div>

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
