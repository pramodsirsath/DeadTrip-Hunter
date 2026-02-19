const User = require('../models/user');
const jwt = require('jsonwebtoken');

module.exports.isAuthenticated = async function (req, res, next) {
    try {

        let token;

        // 1️⃣ Old system (cookie login)
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // 2️⃣ New system (Authorization header - for APIs / Firebase)
        else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "You are not authenticated"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attach full user (same as before)
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        next();

    } catch (error) {
        console.log("AUTH ERROR:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}
