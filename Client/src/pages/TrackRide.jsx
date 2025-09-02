import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "../components/leafletConfig"; // fixed marker icons
import io from "socket.io-client";

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
    <div className="w-full h-screen">
      {source && destination ? (
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
          {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" weight={4} />}
        </MapContainer>
      ) : (
        <div className="flex items-center justify-center w-full h-screen">Loading map...</div>
      )}
    </div>
  );
}
