import React, { useState, useRef, useCallback, useEffect } from "react";
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { jwtDecode } from "jwt-decode";
import { MapPin, Calendar, Truck, Weight, IndianRupee, FileText, ArrowRight, X, CheckCircle, Search } from "lucide-react";
import PageTransition from "../../../components/PageTransition/PageTransition";
import GlassCard from "../../../components/GlassCard/GlassCard";
import { useToast } from "../../../components/Toast/Toast";

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
      <div style={{ position: 'relative', width: '300px' }}>
        <Search size={16} style={{
          position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
          color: '#999', pointerEvents: 'none', zIndex: 1
        }} />
        <input
          placeholder="Search for address..."
          style={{
            boxSizing: 'border-box',
            border: '1px solid transparent',
            width: '100%',
            height: '40px',
            padding: '0 12px 0 32px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
            fontSize: '14px',
            outline: 'none',
            background: 'white',
            color: 'black'
          }}
        />
      </div>
    </Autocomplete>
  );
}

export default function PostLoad() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const toast = useToast();
  const [form, setForm] = useState({
    source: { lat: "", lng: "" },
    destination: { lat: "", lng: "" },
    date: "",
    truckType: "",
    loadDetails: "",
    weight: "",
    fare: "",
  });

  const [selecting, setSelecting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [mapZoom, setMapZoom] = useState(5);
  
  const mapRef = useRef(null);

  const onLoadMap = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback((map) => {
    mapRef.current = null;
  }, []);

  const onPlaceChanged = useCallback((location) => {
    if (selecting) {
      setForm((prev) => ({
        ...prev,
        [selecting]: location
      }));
      // Update center and zoom via state so it persists across re-renders
      setMapCenter(location);
      setMapZoom(15);
    }
  }, [selecting]);

  const onMapClick = (e) => {
    if (selecting) {
      const clickedLocation = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setForm((prev) => ({
        ...prev,
        [selecting]: clickedLocation
      }));
      setMapCenter(clickedLocation);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast("You must be logged in to post a load!", "error");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = decoded?.id;

      const payload = { ...form, customer_id: userId };

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/rides/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const loadData = await res.json();
      if (!res.ok) {
        toast("Failed to post load: " + loadData.message, "error");
        return;
      }

      toast("Load posted successfully!", "success");

      setForm({
        source: { lat: "", lng: "" },
        destination: { lat: "", lng: "" },
        date: "",
        truckType: "",
        loadDetails: "",
        weight: "",
        fare: "",
      });
    } catch (err) {
      console.error("Error posting load:", err);
      toast("Something went wrong while posting the load.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        padding: '32px 16px',
        maxWidth: '720px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div className="animate-fadeInUp" style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}>
            Post a <span className="gradient-text">Load</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Fill in the details and find drivers for your cargo
          </p>
        </div>

        <GlassCard delay={0.1}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {/* Source & Destination Selection */}
            <div className="flex-wrap stack-mobile" style={{
              display: 'flex',
              gap: '12px',
            }}>
              <button
                type="button"
                className={form.source.lat ? 'btn btn-success' : 'btn btn-ghost'}
                onClick={() => setSelecting("source")}
                style={{ flex: 1, padding: '14px', justifyContent: 'flex-start' }}
              >
                <MapPin size={18} />
                {form.source.lat ? 'Source Set ✓' : 'Select Source'}
              </button>

              <button
                type="button"
                className={form.destination.lat ? 'btn btn-success' : 'btn btn-ghost'}
                onClick={() => setSelecting("destination")}
                style={{ flex: 1, padding: '14px', justifyContent: 'flex-start' }}
              >
                <MapPin size={18} />
                {form.destination.lat ? 'Dest. Set ✓' : 'Select Destination'}
              </button>
            </div>

            {/* Coordinates display */}
            {(form.source.lat || form.destination.lat) && (
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                fontSize: '0.8rem',
                color: 'var(--text-tertiary)',
              }}>
                {form.source.lat && (
                  <span>📍 Source: {Number(form.source.lat).toFixed(4)}, {Number(form.source.lng).toFixed(4)}</span>
                )}
                {form.destination.lat && (
                  <span>📍 Dest: {Number(form.destination.lat).toFixed(4)}, {Number(form.destination.lng).toFixed(4)}</span>
                )}
              </div>
            )}

            {/* Date */}
            <div className="input-group">
              <Calendar size={18} className="input-icon" />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input"
                required
                style={{ paddingLeft: '42px' }}
              />
            </div>

            {/* Truck Type */}
            <div className="input-group">
              <Truck size={18} className="input-icon" />
              <select
                name="truckType"
                value={form.truckType}
                onChange={handleChange}
                className="input"
                required
                style={{ paddingLeft: '42px' }}
              >
                <option value="">Select Truck Type</option>
                <option value="Container">Container</option>
                <option value="Open">Open</option>
                <option value="Trailer">Trailer</option>
              </select>
            </div>

            {/* Weight */}
            <div className="input-group">
              <Weight size={18} className="input-icon" />
              <input
                type="text"
                name="weight"
                placeholder="Weight (e.g., 10 tons)"
                value={form.weight}
                onChange={handleChange}
                className="input"
                required
                style={{ paddingLeft: '42px' }}
              />
            </div>

            {/* Fare */}
            <div className="input-group">
              <IndianRupee size={18} className="input-icon" />
              <input
                type="number"
                name="fare"
                placeholder="Fare (in ₹)"
                value={form.fare}
                onChange={handleChange}
                className="input"
                required
                style={{ paddingLeft: '42px' }}
              />
            </div>

            {/* Load Details */}
            <div className="input-group">
              <FileText size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '16px',
                color: 'var(--text-tertiary)',
                pointerEvents: 'none',
              }} />
              <textarea
                name="loadDetails"
                placeholder="Load Details (describe your cargo)"
                value={form.loadDetails}
                onChange={handleChange}
                className="input"
                required
                style={{ paddingLeft: '42px', minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-md)',
                marginTop: '8px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    animation: 'spin 0.6s linear infinite',
                    display: 'inline-block',
                  }} />
                  Posting...
                </span>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Post Load
                </>
              )}
            </button>
          </form>
        </GlassCard>

        {/* Map Modal */}
        {selecting && (
          <div className="modal-overlay" onClick={() => setSelecting(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
              width: '95%', maxWidth: '900px',
              height: '80vh',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                  <MapPin size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '8px' }} />
                  Select {selecting === "source" ? "Source" : "Destination"} Location
                </h3>
                <button
                  onClick={() => setSelecting(null)}
                  className="btn btn-ghost"
                  style={{ padding: '8px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ flex: 1, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
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
                    <div style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1, display: 'flex', justifyContent: 'center' }}>
                      <PlaceSearchBox onPlaceSelected={onPlaceChanged} />
                    </div>

                    {form[selecting]?.lat && (
                      <Marker position={{ lat: Number(form[selecting].lat), lng: Number(form[selecting].lng) }} />
                    )}
                  </GoogleMap>
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <p>Loading map...</p>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '16px',
              }}>
                <button onClick={() => setSelecting(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button
                  onClick={() => setSelecting(null)}
                  className="btn btn-primary"
                  disabled={!form[selecting]?.lat}
                  style={{ opacity: form[selecting]?.lat ? 1 : 0.5 }}
                >
                  <CheckCircle size={16} />
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </PageTransition>
  );
}
