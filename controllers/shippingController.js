// controllers/shippingController.js
const pool = require('../db');  // Assuming you have a database connection in db.js

// Function to handle GET request to get all vendors
const getAllShippers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Shipping');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Function to handle POST request to create a new vendor
const createShipper = async (req, res) => {
  console.log("Received Body:", req.body); // Debugging line
  
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }
  
  const { carriername, trackingnumber, vendorid, estimateddeliverydate } = req.body;

  if (!carriername || !trackingnumber || !vendorid || !estimateddeliverydate ) {
    return res.status(400).json({ error: "Missing required fields" }); //adding Debug Line
  }

  try {
    const result = await pool.query(
      'INSERT INTO Shipping (carriername, trackingnumber, vendorid, estimateddeliverydate) VALUES ($1, $2, $3, $4) RETURNING *',
      [carriername, trackingnumber, vendorid, estimateddeliverydate]
    );
    console.log("Inserted Shipper",result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { getAllShippers, createShipper };