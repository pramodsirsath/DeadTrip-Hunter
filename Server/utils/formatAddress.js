const formatGoogleAddress = (components) => {
  if (!components || !Array.isArray(components)) return "Unknown Location";

  let area = "";
  let taluka = "";
  let district = "";
  let state = "";

  for (const comp of components) {
    const types = comp.types;
    if (!area && (types.includes("sublocality") || types.includes("sublocality_level_1") || types.includes("sublocality_level_2") || types.includes("neighborhood") || types.includes("route"))) {
      area = comp.long_name;
    }
    if (!taluka && (types.includes("locality") || types.includes("administrative_area_level_3"))) {
      taluka = comp.long_name;
    }
    if (!district && types.includes("administrative_area_level_2")) {
      district = comp.long_name;
    }
    if (!state && types.includes("administrative_area_level_1")) {
      state = comp.long_name;
    }
  }

  // Remove duplicates and join
  const parts = [];
  if (area) parts.push(area);
  if (taluka && taluka !== area) parts.push(taluka);
  if (district && district !== taluka && district !== area) parts.push(district);
  if (state && state !== district && state !== taluka && state !== area) parts.push(state);

  return parts.join(", ") || "Unknown Location";
};

module.exports = formatGoogleAddress;
