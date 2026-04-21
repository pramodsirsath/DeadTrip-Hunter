const User = require("../models/user");
const OTP = require("../models/otp");
const { sendOtpEmail } = require("../services/email.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.sendOtp = async function(req, res) {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        // Remove old OTPs for this email just in case
        await OTP.deleteMany({ email });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.create({ email, otp });
        
        // Send email
        await sendOtpEmail(email, otp);

        // Console for local testing if nodemon/server runs
        console.log("OTP GENERATED:", otp);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports.register=async function(req,res){
   const {role,name,email,phone,location,password,truckNumber,truckType,licenseNumber,otp}=req.body;

   try{
    if(!name || !email || !phone || !password){
        return res.status(400).json({
            message:"Please fill all the fields"
        })
    }
    // Check if user already exists
    let user=await User.findOne({email})
    if(user){
        return res.status(400).json({
            message:"User already exists"
        })
    }

    // Verify OTP
    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) {
        return res.status(400).json({
            message: "Invalid or expired OTP"
        });
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword=await bcrypt.hash(password,salt);
    

     user =await User.create({
        role,
        name,
        email,
        phone,
        location,
        password:hashedPassword,
        truckType, // Default value for truckType
        truckNumber, // Default value for truckNumber
        licenseNumber, // Default value for licenseNumber
    })
    // Create a token
    const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{
        expiresIn:"2d",
    })

  res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 2 * 24 * 60 * 60 * 1000,
  sameSite: "Lax", // ← important for cross-origin requests
});

    return res.status(201).json({
        message:"User registered successfully",
        user
    })

   }catch(err){
       console.error(err);
       return res.status(500).json({message:"Internal Server Error"});
   }
}




module.exports.login=async function(req,res){
    const {email,password}=req.body;

   try {
     if(!email || !password){
        return res.status(400).json({
            message:"Please fill all the fields"
        })
    }
    let user=await User.findOne({email});
    if(!user){
        return res.status(400).json({
            message:"User does not exist"
        })
    }
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({
            message:"Invalid Password"
        })
    }
    const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{
        expiresIn:"2d",
    })

    res.cookie("token",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
        
    })
    return res.status(200).json({
        message : "User logged in successfully",
        token: token,
        user
    })

    
   } catch (error) {
         console.error(error);
         return res.status(500).json({message:"Internal Server Error"});
    
   }

}



module.exports.getUserProfile = async function(req, res) {
    res.status(200).json({
        user: req.user, // This will contain the user data from the middleware
    });
}