const mongoose = require('mongoose');

const connectDB = async () => {
     try{
       const conn= await mongoose.connect(`${process.env.MONGODB_URL}`);
       console.log("MOngodb connected successfully");

     }catch(err){
         console.error(`Error: ${err.message}`);
         process.exit(1); // Exit the process with failure
     }
}

module.exports=connectDB