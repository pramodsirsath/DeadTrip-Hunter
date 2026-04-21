const express = require('express');
const { register, getUserProfile, sendOtp } = require('../controllers/auth.controller');
const router = express.Router();
const {login}  = require('../controllers/auth.controller');

const { isAuthenticated } = require('../middlewares/auth.middleware');
const { saveFCMToken } = require('../controllers/userController');

router.post('/send-otp', sendOtp);
router.post('/register',register);
router.post('/login',login);

router.get('/me',isAuthenticated,getUserProfile);
router.post("/save-fcm-token",isAuthenticated, saveFCMToken);


module.exports = router;