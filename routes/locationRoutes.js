// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');  // Assuming the database connection is in db.js

// Get all locations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Location');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get location by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Location WHERE locationid = $1', [id]);  // Use locationID for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new location
router.post('/', async (req, res) => {
  console.log("Request Headers:", req.headers);
  console.log("Received Request Body:", req.body); // Debugging

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const { address, capacity } = req.body;

  if (!address || !capacity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Location (address, capacity) VALUES ($1, $2) RETURNING *',
      [address, capacity]
    );
    console.log("Inserted Location:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Update a location
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { address, capacity } = req.body;

  console.log("Received Request Body:", req.body); // Debugging log

  if (!address || !capacity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'UPDATE Location SET address = $1, capacity = $2 WHERE locationid = $3 RETURNING *',
      [address, capacity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Partially update a Location
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  //  Build dynamic SET clause
  const setClause = Object.keys(fields)
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');
  const values = Object.values(fields);

  try {
    const query = `UPDATE Location SET ${setClause} WHERE locationid = $${values.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Delete a Location
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Location WHERE locationid = $1 RETURNING *', [id]);  // Use locationid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ message: 'Location deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
