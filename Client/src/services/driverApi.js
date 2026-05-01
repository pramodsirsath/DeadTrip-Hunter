export const planReturnRoute = async (payload) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/return/rides/start`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});


  return res.json();
};
