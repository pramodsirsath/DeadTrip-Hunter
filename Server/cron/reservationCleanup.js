import cron from "node-cron";
import RideReservation from "../models/RideReservation.js";

cron.schedule("* * * * *", async () => {
  await RideReservation.deleteMany({
    expiresAt: { $lt: new Date() }
  });
});