// routes/alertRoutes.js
const { runAllAlerts } = require('../controllers/alertController');
const express = require('express');
const router = express.Router();
const pool = require('../db');  // Assuming the database connection is in db.js

// Get all alerts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Alerts');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to manually trigger all alert checks
router.get('/run-checks', runAllAlerts); //  Let runAllAlerts handle the response


// Get alert by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Alerts WHERE alertid = $1', [id]);  // Use alertid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new alert
router.post('/', async (req, res) => {
  console.log("Request Headers:", req.headers);
  console.log("Received Request Body:", req.body); // Debugging

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const { alerttype, affecteditemid, datetriggered, alertstatus, department } = req.body;

  if (!alerttype || !affecteditemid || !datetriggered || !alertstatus ||!department) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Alerts (alerttype, affecteditemid, datetriggered, alertstatus, department) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [alerttype, affecteditemid, datetriggered, alertstatus, department]
    );
    console.log("Inserted Alert:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Update an alert
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { alerttype, affecteditemid, datetriggered, alertstatus, department } = req.body;

  console.log("Received Request Body:", req.body); // Debugging log

  if (!alerttype || !affecteditemid || !datetriggered || !alertstatus ||!department) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'UPDATE Alerts SET alerttype = $1, affecteditemid = $2, datetriggered = $3, alertstatus = $4, department = $5 WHERE alertid = $6 RETURNING *',
      [alerttype, affecteditemid, datetriggered, alertstatus, department, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete an alert
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Alerts WHERE alertid = $1 RETURNING *', [id]);  // Use alertid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete all alerts — Janelle added for testing reset
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM Alerts');
    res.json({ message: 'All alerts deleted.' });
  } catch (err) {
    console.error("Error deleting all alerts:", err);
    res.status(500).json({ error: "Failed to delete all alerts." });
  }
});




module.exports = router;
