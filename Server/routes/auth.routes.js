const express = require('express');
const { register, getUserProfile, sendOtp } = require('../controllers/auth.controller');
const router = express.Router();
const {login}  = require('../controllers/auth.controller');

const { isAuthenticated } = require('../middlewares/auth.middleware');
const { saveFCMToken } = require('../controllers/userController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

router.post('/send-otp', sendOtp);
router.post('/register', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'rcBook', maxCount: 1 },
  { name: 'aadhar', maxCount: 1 }
]), register);
router.post('/login',login);

router.get('/me',isAuthenticated,getUserProfile);
router.post("/save-fcm-token",isAuthenticated, saveFCMToken);


module.exports = router;