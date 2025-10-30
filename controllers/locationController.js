// controllers/locationController.js
const pool = require('../db');  // Assuming you have a database connection in db.js

// Function to handle GET request to get all locations
const getAllLocations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Location');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to handle POST request to create a new location
const createLocation = async (req, res) => {
  console.log("Received Body:", req.body); // Debugging line
  
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }
  
  const { address, capacity } = req.body;

  if (!address || !capacity) {
    return res.status(400).json({ error: "Missing required fields" }); //adding Debug Line
  }

  try {
    const result = await pool.query(
      'INSERT INTO Location (address, capacity) VALUES ($1, $2) RETURNING *',
      [address, capacity]
    );
    console.log("Inserted Location",result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAllLocations, createLocation };
