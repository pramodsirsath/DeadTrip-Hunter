const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middlewares/auth.middleware');

// Admin role check middleware could be added here
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin only." });
    }
};

router.get('/pending-drivers', isAuthenticated, isAdmin, adminController.getPendingDrivers);
router.patch('/approve-driver/:id', isAuthenticated, isAdmin, adminController.approveDriver);

router.get('/pending-withdrawals', isAuthenticated, isAdmin, adminController.getPendingWithdrawals);
router.patch('/approve-withdrawal/:id', isAuthenticated, isAdmin, adminController.approveWithdrawal);

module.exports = router;
