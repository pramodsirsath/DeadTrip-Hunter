export const planReturnRoute = async (payload) => {
  const res = await fetch("http://localhost:3000/return/rides/start", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});


  return res.json();
};
