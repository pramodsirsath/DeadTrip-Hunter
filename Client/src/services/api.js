// client/src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api", // backend base URL
});

// ✅ Create a new ride
export const createRide = (rideData) => API.post("/rides", rideData);

// ✅ Get all rides
export const getRides = () => API.get("/rides");

// ✅ Get ride by ID
export const getRideById = (id) => API.get(`/rides/${id}`);

// ✅ Update ride (status, locations, etc.)
export const updateRide = (id, rideData) => API.put(`/rides/${id}`, rideData);

// ✅ Delete ride
export const deleteRide = (id) => API.delete(`/rides/${id}`);

export default API;
