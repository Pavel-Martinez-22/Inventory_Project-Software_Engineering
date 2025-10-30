// controllers customer Controller.js
const pool = require("../db"); // Assuming you have a database connection in db.js

// Function to handle GET request to get all customers
const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to handle POST request to create a new customer
const createOrder = async (req, res) => {
  console.log("Received Body:", req.body); // Debugging line

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const { customerid, orderdate, shippingstatus } = req.body;

  if (!customerid || !orderdate || !shippingstatus) {
    return res.status(400).json({ error: "Missing required fields" }); //adding Debug Line
  }

  try {
    const result = await pool.query(
      "INSERT INTO orders (customerid, orderdate, shippingstatus) VALUES ($1, $2, $3) RETURNING *",
      [customerid, orderdate, shippingstatus] // Parameters passed as an array
    );
    console.log("Inserted New Order", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAllOrders, createOrder };
