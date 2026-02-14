import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export default function CheckMap({ data }) {
    if (!data || !data.currentLocation || !data.homeLocation || !data.route || !data.corridor) {
        console.log(data);
    return <p>Loading map...</p>;
  }

  const current = data.currentLocation.coordinates;
  const home = data.homeLocation.coordinates;

  return (
    <MapContainer
      center={[current[1], current[0]]}
      zoom={9}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Corridor Polygon */}
      <GeoJSON
        data={data.corridor}
        style={{
          color: "red",
          weight: 2,
          fillOpacity: 0.15
        }}
      />

      {/* Route Line */}
      <GeoJSON
        data={data.route}
        style={{
          color: "blue",
          weight: 4
        }}
      />

      {/* Current Location */}
      <Marker position={[current[1], current[0]]}>
        <Popup>Driver Current Location</Popup>
      </Marker>

      {/* Home Location */}
      <Marker position={[home[1], home[0]]}>
        <Popup>Driver Home</Popup>
      </Marker>
    </MapContainer>
  );
}
