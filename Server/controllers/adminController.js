const User = require("../models/user");
const Withdrawal = require("../models/Withdrawal");

exports.getPendingDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver', isApproved: false }).select('-password');
    res.status(200).json(drivers);
  } catch (error) {
    console.error("Error fetching pending drivers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.approveDriver = async (req, res) => {
  try {
    const driverId = req.params.id;
    const { action } = req.body; // 'approve' or 'reject'

    if (action === 'approve') {
      await User.findByIdAndUpdate(driverId, { isApproved: true });
      res.status(200).json({ message: "Driver approved successfully" });
    } else {
      await User.findByIdAndDelete(driverId);
      res.status(200).json({ message: "Driver rejected and removed" });
    }
  } catch (error) {
    console.error("Error approving/rejecting driver:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' }).populate('driverId', 'name phone email');
    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Error fetching pending withdrawals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const withdrawalId = req.params.id;
    const { action } = req.body; // 'approve' or 'reject'

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal || withdrawal.status !== 'pending') {
      return res.status(400).json({ error: "Invalid or already processed withdrawal" });
    }

    if (action === 'approve') {
      withdrawal.status = 'completed';
      await withdrawal.save();
      res.status(200).json({ message: "Withdrawal approved" });
    } else {
      withdrawal.status = 'failed';
      await withdrawal.save();
      
      // Refund wallet
      const driver = await User.findById(withdrawal.driverId);
      if (driver) {
        driver.walletBalance += withdrawal.amount;
        await driver.save();
      }
      res.status(200).json({ message: "Withdrawal rejected and refunded" });
    }
  } catch (error) {
    console.error("Error approving/rejecting withdrawal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
