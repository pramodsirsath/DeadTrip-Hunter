import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Home, X, CheckCircle, Search } from 'lucide-react';

const libraries = ['places'];

function PlaceSearchBox({ onPlaceSelected }) {
  const [autocomplete, setAutocomplete] = useState(null);

  const onLoad = (ac) => {
    setAutocomplete(ac);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        onPlaceSelected({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{ componentRestrictions: { country: "in" } }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        <Search size={16} style={{
          position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
          color: '#999', pointerEvents: 'none', zIndex: 1
        }} />
        <input
          placeholder="Search for location..."
          style={{
            boxSizing: 'border-box',
            border: '1px solid var(--border-subtle)',
            width: '100%',
            height: '40px',
            padding: '0 12px 0 32px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            outline: 'none',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)'
          }}
        />
      </div>
    </Autocomplete>
  );
}

export default function HomeLocationMap({ onConfirm, onCancel, loading }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [homeLocation, setHomeLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [mapZoom, setMapZoom] = useState(5);
  const mapRef = useRef(null);

  const onLoadMap = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const onPlaceSelected = useCallback((location) => {
    setHomeLocation(location);
    // Update center and zoom via state so it persists across re-renders
    setMapCenter(location);
    setMapZoom(15);
  }, []);

  const onMapClick = (e) => {
    const clickedLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setHomeLocation(clickedLocation);
    setMapCenter(clickedLocation);
  };

  return createPortal(
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
          marginBottom: '12px',
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

        {/* Search Box — OUTSIDE GoogleMap so suggestions render properly in portal */}
        {isLoaded && (
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <PlaceSearchBox onPlaceSelected={onPlaceSelected} />
          </div>
        )}

        {/* MAP CONTAINER */}
        <div style={{
          flex: 1,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ height: '100%', width: '100%' }}
              center={mapCenter}
              zoom={mapZoom}
              onLoad={onLoadMap}
              onUnmount={onUnmount}
              onClick={onMapClick}
              options={{ streetViewControl: false, mapTypeControl: false }}
            >
              {homeLocation && (
                <Marker position={homeLocation} />
              )}
            </GoogleMap>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <p>Loading map...</p>
            </div>
          )}

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
    </div>,
    document.body
  );
}
