// api/loadApi.js
import axios from "axios";

export const fetchReturnLoads = token =>
  axios.get("/loads/return", {
    headers: { Authorization: `Bearer ${token}` }
  });
