const Load = require('../models/load');
const User = require('../models/user');
const { sendCustomerEmail } = require('../services/email.service');


module.exports.loadData = async function (req, res) {
    try {


        const { source, destination, date, truckType, loadDetails, weight, userId, status } = req.body;
        if (!source || !destination || !date || !truckType || !loadDetails || !weight || !userId || !status) {
            return res.status(400).json({ error: "All fields are required" });
        }


        // Create a new load entry
        const newLoad = new Load({
            source,
            destination,
            date,
            truckType,
            loadDetails,
            weight,
            status,
            userId
        })

        const load = await Load.create(newLoad);
        res.status(201).json({
            message: "Load created successfully",
            load
        });
    } catch (error) {
        console.error("Error fetching load data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// Example: GET /api/loads?userId=123
module.exports.getUserLoads = async (req, res) => {
    const userId = req.query.userId;
    const loads = await Load.find({ userId: userId }); // adjust field as needed
    res.json(loads);
}

module.exports.cancelLoad = async (req, res) => {
    const loadId = req.params.id;
    try {
        const cancelLoad = await Load.findById(loadId);
        if (!cancelLoad) {
            return res.status(404).json({ error: "Load not found" });
        }
        await Load.deleteOne({ _id: loadId });
        res.status(200).json({ message: "Load cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling load:", error);
        res.status(500).json({ error: "Internal server error" });

    }
}

module.exports.SeeData = async (req, res) => {
    try {
        const loads = await Load.find({status:'pending'});
        res.status(200).json(loads);
    } catch (error) {
        console.error("Error fetching loads:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}



module.exports.acceptLoad = async (req, res) => {
    const loadId = req.params.id;
    const driverId = req.body.userId;

    try {
        const load = await Load.findById(loadId);
        if (!load) {
            return res.status(404).json({ error: "Load not found" });
        }

        if (load.status === 'accepted') {
            return res.status(400).json({ error: "Load already accepted" });
        }

        const customerId = load.userId;
        const driver = await User.findById(driverId);
        const customer = await User.findById(customerId);

        // ✅ Ensure driver and customer exist
        if (!driver) {
            return res.status(404).json({ error: "Driver not found" });
        }
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        // ✅ Update load
        load.status = 'accepted';
        load.driverId = driverId;
        load.acceptedAt = new Date();
        await load.save();

        console.log("Preparing to send email with:");
console.log("customer.email:", customer?.email);
console.log("driver.name:", driver?.name);
console.log("load info:", load?.source, load?.destination);


        // ✅ Send Email
        await sendCustomerEmail({
            customerEmail: customer.email,
            customerName: customer.name,
            driver: {
                name: driver.name,
                phone: driver.phone,
                vehicleNumber: driver.vehicleNumber
            },
            load: {
                source: load.source,
                destination: load.destination,
                date: load.date,
                truckType: load.truckType,
                weight: load.weight
            }
        });

        res.status(200).json({ message: "Load accepted and customer notified" });

    } catch (error) {
        console.error("Error accepting load:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


