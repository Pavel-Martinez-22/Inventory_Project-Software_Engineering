// controllers/agingInventoryController.js
const pool = require('../db');  // Assuming you have a database connection in db.js

// Function to handle GET request to get all vendors
const getAllAgingInventory = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM AgingInventory');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to handle POST request to create a new vendor
const createAgingInventory = async (req, res) => {
  console.log("Received Body:", req.body); // Debugging line
  
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }
  
  const { itemid, agingdate, quantity } = req.body;

  if (!itemid || !agingdate || !quantity) {
    return res.status(400).json({ error: "Missing required fields" }); //adding Debug Line
  }

  try {
    const result = await pool.query(
      'INSERT INTO AgingInventory (itemid, agingdate, quantity) VALUES ($1, $2, $3) RETURNING *',
      [itemid, agingdate, quantity]
    );
    console.log("Inserted Aging Inventory",result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAllAgingInventory, createAgingInventory };
