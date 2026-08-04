import { GoogleMap, Marker, Polyline, Polygon, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { useState } from "react";

const libraries = ['places'];

export default function CheckMap({ data }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [activeMarker, setActiveMarker] = useState(null);

  const isValidCoordinatePair = (value) =>
    Array.isArray(value) && value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number";

  if (!data || !data.currentLocation || !data.homeLocation || !data.route || !data.corridor) {
    console.log(data);
    return <p>Loading map data...</p>;
  }

  const current = isValidCoordinatePair(data.currentLocation?.coordinates)
    ? { lat: data.currentLocation.coordinates[1], lng: data.currentLocation.coordinates[0] }
    : null;
  const home = isValidCoordinatePair(data.homeLocation?.coordinates)
    ? { lat: data.homeLocation.coordinates[1], lng: data.homeLocation.coordinates[0] }
    : null;
  
  let routePath = [];
  if (Array.isArray(data.route?.coordinates)) {
    routePath = data.route.coordinates.filter(isValidCoordinatePair).map(coord => ({ lat: coord[1], lng: coord[0] }));
  }

  let corridorPath = [];
  if (Array.isArray(data.corridor?.coordinates) && Array.isArray(data.corridor.coordinates[0])) {
    corridorPath = data.corridor.coordinates[0].filter(isValidCoordinatePair).map(coord => ({ lat: coord[1], lng: coord[0] }));
  }

  if (!isLoaded || !current || !home) return <p>Loading map data...</p>;

  return (
    <GoogleMap
      center={current}
      zoom={9}
      mapContainerStyle={{ height: "600px", width: "100%" }}
    >
      {/* Corridor Polygon */}
      {corridorPath.length > 0 && (
        <Polygon
          paths={corridorPath}
          options={{
            strokeColor: "red",
            strokeWeight: 2,
            fillColor: "red",
            fillOpacity: 0.15
          }}
        />
      )}

      {/* Route Line */}
      {routePath.length > 0 && (
        <Polyline
          path={routePath}
          options={{
            strokeColor: "blue",
            strokeWeight: 4
          }}
        />
      )}

      {/* Current Location */}
      <Marker position={current} onClick={() => setActiveMarker("current")} />
      {activeMarker === "current" && (
        <InfoWindow position={current} onCloseClick={() => setActiveMarker(null)}>
          <div>Driver Current Location</div>
        </InfoWindow>
      )}

      {/* Home Location */}
      <Marker position={home} onClick={() => setActiveMarker("home")} />
      {activeMarker === "home" && (
        <InfoWindow position={home} onCloseClick={() => setActiveMarker(null)}>
          <div>Driver Home</div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
