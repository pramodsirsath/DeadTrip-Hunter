const express = require('express');
const { register, getUserProfile } = require('../controllers/auth.controller');
const router = express.Router();
const {login}  = require('../controllers/auth.controller');

const { isAuthenticated } = require('../middlewares/auth.middleware');



router.post('/register',register);
router.post('/login',login);

router.get('/me',isAuthenticated,getUserProfile);

module.exports = router;