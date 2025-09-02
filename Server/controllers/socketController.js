module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinRide", (rideId) => socket.join(rideId));
    socket.on("leaveRide", (rideId) => socket.leave(rideId));

    socket.on("driverLocation", ({ rideId, coordinates }) => {
      socket.to(rideId).emit("driverLocationUpdate", { rideId, coordinates });
    });

    socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
  });
};
