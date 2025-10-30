// routes/agingInventoryRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');  // Assuming the database connection is in db.js

// Get all aging inventory
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM AgingInventory');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get aging by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM AgingInventory WHERE agingid = $1', [id]);  // Use agingid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AgingInventory not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new aginginventory
router.post('/', async (req, res) => {
  console.log(" Request Headers:", req.headers);
  console.log("Received Request Body:", req.body); // Debugging

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const { itemid, agingdate, quantity } = req.body;

  if (!itemid || !agingdate || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO AgingInventory (itemid, agingdate, quantity) VALUES ($1, $2, $3) RETURNING *',
      [itemid, agingdate, quantity]
    );
    console.log("Inserted AgingInventory:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Update an agingInventory
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { itemid, agingdate, quantity } = req.body;

  console.log("Received Request Body:", req.body); // Debugging log

  if (!itemid || !agingdate || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'UPDATE AgingInventory SET itemid = $1, agingdate = $2, quantity = $3 WHERE agingid = $4 RETURNING *',
      [itemid, agingdate, quantity]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AgingInventory not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//update partial aginginventory
router.patch('/:id', async (req, res)=> {
  const { id } = req.params;
  const fields = req.body;

  // Return early if no fields are provided
  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  // Build dynamic SET clause 
  const setClause = Object.keys(fields).map((field, index) => `${field} = $${index + 1}`).join(', ');
  const values = Object.values(fields);

  try {
    const query = `UPDATE AgingInventory 
                  SET ${setClause} 
                  WHERE agingid = $${values.length + 1} 
                  RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AgingInventory not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete an agingInventory
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM AgingInventory WHERE agingid = $1 RETURNING *', [id]);  // Use agingid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AgingInventory not found' });
    }
    res.json({ message: 'AgingInventory deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
