import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Home, X, CheckCircle } from 'lucide-react';

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
    <div className="modal-overlay" onClick={() => !loading && onCancel()}>
      <div className="modal-content animate-scaleIn" onClick={(e) => e.stopPropagation()} style={{
        width: '95%',
        maxWidth: '900px',
        height: '85vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h2 style={{
            fontWeight: '700',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Home size={20} style={{ color: 'var(--accent-blue)' }} />
            Select Home Location
          </h2>
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-ghost"
            style={{ padding: '8px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* MAP CONTAINER */}
        <div style={{
          flex: 1,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <LocationPicker onPick={setHomeLocation} />

            {homeLocation && (
              <Marker position={[homeLocation.lat, homeLocation.lng]} />
            )}
          </MapContainer>

          {/* Loading Overlay */}
          {loading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            }}>
              <div className="glass-card animate-scaleIn" style={{
                padding: '24px 32px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  border: '3px solid var(--bg-tertiary)',
                  borderTopColor: 'var(--accent-blue)',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 14px',
                }} />
                <p style={{ fontWeight: '600', marginBottom: '6px' }}>
                  Calculating return corridor...
                </p>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-tertiary)',
                }}>
                  Finding rides along your way home
                </p>
              </div>
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '16px',
        }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(homeLocation)}
            disabled={!homeLocation || loading}
            className="btn btn-primary"
            style={{
              opacity: (!homeLocation || loading) ? 0.5 : 1,
              cursor: (!homeLocation || loading) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  animation: 'spin 0.6s linear infinite',
                  display: 'inline-block',
                }} />
                Starting...
              </span>
            ) : (
              <>
                <CheckCircle size={16} />
                Confirm Home Location
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
