// routes/vendorRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');  // Assuming the database connection is in db.js

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Vendor');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get vendor by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Vendor WHERE vendorid = $1', [id]);  // Use vendorID for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new vendor
router.post('/', async (req, res) => {
  console.log(" Request Headers:", req.headers);
  console.log("Received Request Body:", req.body); // Debugging

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const { vendorname, contactinfo, address } = req.body;

  if (!vendorname || !contactinfo || !address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Vendor (vendorname, contactinfo, address) VALUES ($1, $2, $3) RETURNING *',
      [vendorname, contactinfo, address]
    );
    console.log("Inserted Vendor:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Update a vendor
/* router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { vendorname, contactinfo, address } = req.body;

  console.log("Received Request Body:", req.body); // Debugging log

  if (!vendorname || !contactinfo || !address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'UPDATE vendor SET vendorname = $1, contactinfo = $2, address = $3 WHERE vendorid = $4 RETURNING *',
      [vendorname, contactinfo, address, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}); */

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  
  const fields = req.body;

  if (!id) {
    return res.status(400).json({ error: "Missing vendor ID" });
  }

  // Ensure at least one field is being updated
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  // Build SET clause dynamically
  const setClauses = keys.map((key, idx) => `${key} = $${idx + 1}`);
  const values = Object.values(fields);

  const query = `
    UPDATE vendor
    SET ${setClauses.join(', ')}
    WHERE vendorid = $${keys.length + 1}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Delete a vendor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Vendor WHERE vendorID = $1 RETURNING *', [id]);  // Use vendorID for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json({ message: 'Vendor deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
