import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";

import io from "socket.io-client";
import { ArrowLeft, Navigation, MapPin, Compass, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

const socket = io("http://localhost:3000");

const libraries = ['places'];
const mapContainerStyle = { width: "100%", height: "100%" };

const driverIconUrl = "/driver-marker.png";
const SourceIconUrl = "/sourceIcon.png";
const DestinationIconUrl = "/destinationIcon.png";

export default function TrackRide() {
  const { rideId } = useParams();
  const [driverLocation, setDriverLocation] = useState(null);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  
  // Navigation Mode States
  const [isDrivingMode, setIsDrivingMode] = useState(false);
  const [heading, setHeading] = useState(0);
  const prevLocationRef = React.useRef(null);

  // Check if current user is driver
  const userRole = localStorage.getItem("role");
  const isDriver = userRole === "driver";

  // Helper to calculate bearing
  const getBearing = (start, end) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;
    const dLng = toRad(end.lng - start.lng);
    const lat1 = toRad(start.lat);
    const lat2 = toRad(end.lat);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Fetch ride & listen for driver location
  useEffect(() => {
    if (!rideId) return;

    fetch(`http://localhost:3000/rides/${rideId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.source && data.destination) {
          setSource({ lat: data.source.coordinates[1], lng: data.source.coordinates[0] });
          setDestination({ lat: data.destination.coordinates[1], lng: data.destination.coordinates[0] });
        }
      });

    socket.emit("joinRide", rideId);
    socket.on("driverLocationUpdate", (data) => {
      if (data.rideId === rideId) {
        const newLoc = { lat: data.coordinates[1], lng: data.coordinates[0] };
        
        if (prevLocationRef.current) {
          const newHeading = getBearing(prevLocationRef.current, newLoc);
          // Only update heading if moved significantly
          if (newLoc.lat !== prevLocationRef.current.lat || newLoc.lng !== prevLocationRef.current.lng) {
            setHeading(newHeading);
          }
        }
        prevLocationRef.current = newLoc;
        setDriverLocation(newLoc);
      }
    });

    return () => {
      socket.off("driverLocationUpdate");
      socket.emit("leaveRide", rideId);
    };
  }, [rideId]);

  // Fetch route from OSRM whenever driverLocation, source, destination change
  useEffect(() => {
    const fetchRoute = async () => {
      if (!driverLocation || !source || !destination) return;

      const coordsStr = `${driverLocation.lng},${driverLocation.lat};${source.lng},${source.lat};${destination.lng},${destination.lat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const route = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
          setRouteCoords(route);
        }
      } catch (err) {
        console.error("Route fetch error:", err);
      }
    };

    fetchRoute();
  }, [driverLocation, source, destination]);

  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 64px)',
      position: 'relative',
    }}>
      {isLoaded && source && destination ? (
        <>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={driverLocation || source}
            zoom={isDrivingMode ? 17 : 7}
            heading={isDrivingMode ? heading : 0}
            tilt={isDrivingMode ? 60 : 0}
            options={{ 
              streetViewControl: false, 
              mapTypeControl: false,
              fullscreenControl: false,
              zoomControl: !isDrivingMode
            }}
          >
            <Marker position={source} icon={{ url: SourceIconUrl, scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null }} />
            <Marker position={destination} icon={{ url: DestinationIconUrl, scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null }} />
            {driverLocation && <Marker position={driverLocation} icon={{ url: driverIconUrl, scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : null }} />}
            {routeCoords.length > 0 && <Polyline path={routeCoords} options={{ strokeColor: "#3b82f6", strokeWeight: 4, strokeOpacity: 0.8 }} />}
          </GoogleMap>

          {/* Overlay Header */}
          <div className="animate-fadeInDown" style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}>
            <Link to={-1} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              flexShrink: 0,
            }}>
              <ArrowLeft size={18} />
            </Link>

            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                <Navigation size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px', color: 'var(--accent-blue)' }} />
                Live Tracking
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Ride #{rideId?.slice(-6)}
              </p>
            </div>

            {driverLocation && (
              <span className="badge badge-ongoing" style={{ fontSize: '0.7rem' }}>
                <span className="dot"></span>
                Driver Live
              </span>
            )}
          </div>

          {/* Navigation Controls (Driver Only) */}
          {isDriver && driverLocation && (
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '12px',
              zIndex: 1000,
            }}>
              <button
                onClick={() => setIsDrivingMode(!isDrivingMode)}
                className={`btn ${isDrivingMode ? 'btn-danger' : 'btn-primary'}`}
                style={{
                  padding: '12px 24px',
                  borderRadius: '30px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                <Compass size={20} />
                {isDrivingMode ? 'Exit Nav' : 'Start Nav'}
              </button>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  padding: '12px',
                  borderRadius: '50%',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Open in Maps App"
              >
                <ExternalLink size={20} />
              </a>
            </div>
          )}
        </>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}>
          <LoadingSpinner text="Loading map..." />
        </div>
      )}
    </div>
  );
}
