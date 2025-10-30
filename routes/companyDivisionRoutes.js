// routes/companyDivisionRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');  // Assuming the database connection is in db.js

// Get all company divisions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companydivision');  // Assuming you want to fetch all company divisions
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get company division by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM companydivision WHERE divisionid = $1', [id]);  // Use divisionID for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'companydivision not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new company division
router.post('/', async (req, res) => {
  console.log(" Request Headers:", req.headers);
  console.log("Received Request Body:", req.body); // Debugging

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const { divisionname, manager } = req.body;

  if (!divisionname || !manager) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO companydivision (divisionname, manager) VALUES ($1, $2) RETURNING *',
      [divisionname, manager]
    );
    console.log("Inserted Company Division:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Update a company division
/* router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { divisionname, manager } = req.body;

  console.log("Received Request Body:", req.body); // Debugging log

  if (!divisionname || !manager) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      'UPDATE companydivision SET divisionname = $1, manager = $2 WHERE divisionid = $4 RETURNING *',
      [divisionname, manager, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company Division not found' });
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
    return res.status(400).json({ error: "Missing division ID" });
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
    UPDATE companydivision
    SET ${setClauses.join(', ')}
    WHERE divisionid = $${keys.length + 1}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Division ID not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Delete a company division
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM companydivision WHERE divisionid = $1 RETURNING *', [id]);  // Use divisionID for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company Division not found' });
    }
    res.json({ message: 'Company Division deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

