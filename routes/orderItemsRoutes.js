// routes/orderItemsRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');  // Assuming the database connection is in db.js

// Get all item orders
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM OrderItems');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get item order by OrderItemId
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM OrderItems WHERE orderitemid = $1', [id]);  // Use orderitemid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new item order
router.post('/', async (req, res) => {
  console.log(" Request Headers:", req.headers);
  console.log("Received Request Body:", req.body); // Debugging

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const { orderid, itemid, quantity } = req.body;

  if (!orderid || !itemid || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO OrderItems (orderid, itemid, quantity) VALUES ($1, $2, $3) RETURNING *',
      [orderid, itemid, quantity]
    );
    console.log("Inserted item order:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Update a item order
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { orderid, itemid, quantity } = req.body;

  console.log("Received Request Body:", req.body); // Debugging log

  if (!orderid || !itemid || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'UPDATE OrderItems SET orderid = $1, itemid = $2, quantity = $3 WHERE orderitemid = $4 RETURNING *',
      [orderid, itemid, quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Partially update an item order
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  // Dynamically build the SET clause
  const setClause = Object.keys(fields)
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');
  const values = Object.values(fields);

  try {
    const query = `UPDATE OrderItems SET ${setClause} WHERE orderitemid = $${values.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a item order
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM OrderItems WHERE orderitemid = $1 RETURNING *', [id]);  // Use orderitemid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item Order not found' });
    }
    res.json({ message: 'Item order deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
