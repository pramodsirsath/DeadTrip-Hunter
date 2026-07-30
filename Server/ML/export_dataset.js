const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.join(__dirname, "../.env"),
});

const Feedback = require("../models/feedback");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function exportDataset() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("MongoDB Connected");

        const feedbacks = await Feedback.find();

        const dataset = feedbacks.map((feedback) => ({
            distance: feedback.ride_distance,
            fare: feedback.fare,
            fuel_price: feedback.fuel_price,
            mileage: feedback.vehicle_mileage,
            weight: parseFloat(feedback.weight),
            profit: feedback.net_profit,
        }));

        const csvWriter = createCsvWriter({
            path: "./ML/dataset.csv",
            header: [
                { id: "distance", title: "distance" },
                { id: "fare", title: "fare" },
                { id: "fuel_price", title: "fuel_price" },
                { id: "mileage", title: "mileage" },
                { id: "weight", title: "weight" },
                { id: "profit", title: "profit" },
            ],
        });

        await csvWriter.writeRecords(dataset);

        console.log("Dataset exported successfully!");

        await mongoose.disconnect();

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

exportDataset();