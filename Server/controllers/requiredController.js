const getFallbackDistance = (source, destination) => {
  const [sourceLng, sourceLat] = source.coordinates;
  const [destinationLng, destinationLat] = destination.coordinates;
  const earthRadiusMeters = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;

  const dLat = toRadians(destinationLat - sourceLat);
  const dLng = toRadians(destinationLng - sourceLng);
  const lat1 = toRadians(sourceLat);
  const lat2 = toRadians(destinationLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
};

const getDistance = async (source, destination) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAP;

  if (!apiKey) {
    console.warn("Google Maps API key not configured. Using fallback distance.");
    return getFallbackDistance(source, destination);
  }

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.distanceMeters",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: source.coordinates[1],
              longitude: source.coordinates[0],
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.coordinates[1],
              longitude: destination.coordinates[0],
            },
          },
        },
        travelMode: "DRIVE",
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.warn(
      "Google Routes distance failed. Using fallback distance:",
      data?.error?.message || `Request failed: ${response.status}`
    );
    return getFallbackDistance(source, destination);
  }

  return data.routes?.[0]?.distanceMeters || getFallbackDistance(source, destination);
};

module.exports = getDistance;
