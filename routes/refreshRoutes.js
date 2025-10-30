// routes/refreshRoutes.js

const express = require('express');
const router = express.Router();
const refreshTokenController = require('../controllers/refreshTokenController');
const pool = require("../db"); // Assuming the database connection is in db.js

router.get('/', refreshTokenController.handleRefreshToken);

module.exports = router;