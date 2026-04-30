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

  if (!data || !data.currentLocation || !data.homeLocation || !data.route || !data.corridor) {
    console.log(data);
    return <p>Loading map data...</p>;
  }

  const current = { lat: data.currentLocation.coordinates[1], lng: data.currentLocation.coordinates[0] };
  const home = { lat: data.homeLocation.coordinates[1], lng: data.homeLocation.coordinates[0] };
  
  let routePath = [];
  if (data.route.coordinates) {
    routePath = data.route.coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }));
  }

  let corridorPath = [];
  if (data.corridor.coordinates && data.corridor.coordinates[0]) {
    corridorPath = data.corridor.coordinates[0].map(coord => ({ lat: coord[1], lng: coord[0] }));
  }

  if (!isLoaded) return <p>Loading map...</p>;

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
