export const getReadableAddress = async (lat, lng) => {
  try {
    const res = await fetch(
      `http://localhost:3000/geo/reverse?lat=${lat}&lng=${lng}`
    );
    const data = await res.json();
    return data.address || "Unknown location";
  } catch (err) {
    console.error("Frontend geo error:", err);
    return "Unknown location";
  }
};
