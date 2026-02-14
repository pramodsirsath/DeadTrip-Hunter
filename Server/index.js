const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/userdb");
const authRoutes = require("./routes/auth.routes");
const rideRoutes = require("./routes/rideRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const geoRoutes = require("./routes/geoRoutes");
const returnLoadRoute = require("./routes/returnLoadRoute");


const { createServer } = require("http");
const { Server } = require("socket.io");
const socketController = require("./controllers/socketController");

dotenv.config();
connectDB();

const app = express();

// ✅ Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
    methods: ["GET", "POST", "PATCH","DELETE"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/rides", rideRoutes);
app.use("/geo", geoRoutes);

app.use("/return", returnLoadRoute);
// Ride + Live Tracking APIs

// ✅ Mailer Config (optional, can move to utils/mailer.js)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Single HTTP + Socket.io server
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"],
  },
});

// ✅ Pass Socket.io instance to controller
socketController(io);

httpServer.listen(3000, () => {
  console.log("🚀 Server + Socket.io running at http://localhost:3000");
  console.log("📡 Listening for live tracking events...");
});
