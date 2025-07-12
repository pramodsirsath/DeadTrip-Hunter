const express=require('express');
const app=express();
const dotenv=require('dotenv');
const connectDB=require('./config/userdb');
const authRoutes = require('./routes/auth.routes');
const loadRoutes = require('./routes/loads.routes');
const cookieParser = require('cookie-parser');
const cors= require('cors');

dotenv.config();
connectDB();
app.use(cors({
  origin: "http://localhost:5173", // allow frontend URL
  credentials: true                // allow cookies if using
}));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/loads', loadRoutes);



app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})