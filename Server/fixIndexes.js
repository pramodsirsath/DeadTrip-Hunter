const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(async () => {
    console.log('Connected to MongoDB.');
    try {
        await mongoose.connection.collection('users').dropIndex('truckNumber_1');
        console.log('Dropped truckNumber_1');
    } catch(e) { console.log(e.message); }
    
    try {
        await mongoose.connection.collection('users').dropIndex('licenseNumber_1');
        console.log('Dropped licenseNumber_1');
    } catch(e) { console.log(e.message); }
    
    console.log('Done.');
    process.exit(0);
});
