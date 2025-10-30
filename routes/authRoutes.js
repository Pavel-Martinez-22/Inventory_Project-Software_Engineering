const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define the /login route
router.post('/login', authController.handleLogin);
router.post('/register', authController.handleRegister);

module.exports = router;