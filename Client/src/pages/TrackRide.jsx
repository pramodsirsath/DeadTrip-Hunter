import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "../components/leafletConfig"; // fixed marker icons
import io from "socket.io-client";
import { ArrowLeft, Navigation, MapPin } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

const socket = io("http://localhost:3000");

const driverIcon = new L.Icon({
  iconUrl: "/driver-marker.png", // custom driver icon
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
const SourceIcon = new L.Icon({
  iconUrl: "/sourceIcon.png", // custom driver icon
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});
const DestinationIcon = new L.Icon({
  iconUrl: "/destinationIcon.png", // custom driver icon
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function TrackRide() {
  const { rideId } = useParams();
  const [driverLocation, setDriverLocation] = useState(null);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  // Fetch ride & listen for driver location
  useEffect(() => {
    if (!rideId) return;

    fetch(`http://localhost:3000/rides/${rideId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.source && data.destination) {
          setSource([data.source.coordinates[1], data.source.coordinates[0]]);
          setDestination([data.destination.coordinates[1], data.destination.coordinates[0]]);
        }
      });

    socket.emit("joinRide", rideId);
    socket.on("driverLocationUpdate", (data) => {
      if (data.rideId === rideId) {
        setDriverLocation([data.coordinates[1], data.coordinates[0]]);
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

      const coordsStr = `${driverLocation[1]},${driverLocation[0]};${source[1]},${source[0]};${destination[1]},${destination[0]}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const route = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
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
      {source && destination ? (
        <>
          <MapContainer
            center={driverLocation || source}
            zoom={7}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={source} icon={SourceIcon} />
            <Marker position={destination} icon={DestinationIcon} />
            {driverLocation && <Marker position={driverLocation} icon={driverIcon} />}
            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="#3b82f6" weight={4} opacity={0.8} />}
          </MapContainer>

          {/* Overlay Header */}
          <div className="glass-strong animate-fadeInDown" style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            zIndex: 1000,
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
