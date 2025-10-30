// routes/shippingRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');  // Assuming the database connection is in db.js

// Get all shippers
router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM Shipping');
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
// Get shipper by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM Shipping WHERE shippingid = $1', [id]);  // Use shippingid for primary key
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Shipper not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Create a new shipper
router.post('/', async (req, res) => {
  console.log(" Request Headers:", req.headers);
  console.log("Received Request Body:", req.body); // Debugging

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const {carriername, trackingnumber, vendorid, estimateddeliverydate} = req.body;

  if (!carriername || !trackingnumber || !vendorid) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // If estimatedDeliveryDate is an empty string, set it to null
  const deliveryDate = estimatedDeliveryDate === "" ? null : estimatedDeliveryDate;

  try {
    const result = await pool.query(
      'INSERT INTO Shipping (carriername, trackingnumber, vendorid, estimateddeliverydate) VALUES ($1, $2, $3, $4) RETURNING *',
      [carriername, trackingnumber, vendorid, estimateddeliverydate || null]
    );
    console.log("Inserted Shipper:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Partially update a shipper
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

// Normalize any fields that might have invalid date or "0" values
if (fields.hasOwnProperty('estimateddeliverydate')) {
  if (fields.estimateddeliverydate === "0" || fields.estimateddeliverydate === "") {
    console.log("Converting invalid estimateddeliverydate to null");
    fields.estimateddeliverydate = null;
  }
}
  // Build dynamic SET clause
  const setClause = Object.keys(fields)
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');
  const values = Object.values(fields);

  try {
    const query = `UPDATE Shipping SET ${setClause} WHERE shippingid = $${values.length + 1} RETURNING *`;
    console.log("Generated Query:", query); // Log for debugging
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shipper not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a shipper
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM Shipping WHERE shippingid = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shipper not found' });
    }

    res.json({ message: 'Shipper deleted' });
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  module.exports = router;