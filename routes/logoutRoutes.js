// routes/logoutRoutes.js
const express = require('express');
const router = express.Router();
const logoutController = require('../controllers/logoutController');
const pool = require('../db');  // Assuming the database connection is in db.js

router.get('/', logoutController.handleLogout);

module.exports = router;