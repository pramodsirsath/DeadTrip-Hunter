
const User = require('../models/user');
const jwt = require('jsonwebtoken');

module.exports.isAuthenticated = async function (req, res, next) {
    try {
        const token=req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "You are not authenticated"
            });
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

         req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        
        return res.status(500).json({
            message: "Internal Server Error by middleware"
        });
    }
}