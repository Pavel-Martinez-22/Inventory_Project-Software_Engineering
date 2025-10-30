// routes/customerRouters.js
const express = require("express");
const router = express.Router();
const pool = require("../db"); // Assuming the database connection is in db.js

// Get all customers
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customer");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Company customer by customerid
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM customer WHERE customerid = $1",
      [id]
    ); // Use customerid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new customer
router.post("/", async (req, res) => {
  console.log("Request Headers:", req.headers); //Debugging
  console.log("Received Request Body:", req.body); // Debugging

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const { customername, email, phone, address } = req.body;

  if (!customername || !email || !phone || !address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO customer (customername, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *",
      [customername, email, phone, address] // Parameters passed as an array
    );
    console.log("Inserted Inventory", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
});

// Update a Customer
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { customername, email, phone, address } = req.body;

  console.log("Received Request Body:", req.body); // Debugging log

  if (!customername || !email || !phone || !address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "UPDATE customer SET customername = $1, email = $2, phone = $3, address = $4 WHERE customerid = $5 RETURNING *",
      [customername, email, phone, address, id] // Correctly pass parameters as an array
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//partially update a customer
router.patch('/:id', async(req, res) => {
  const { id } = req.params;
  const fields = req.body;

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  // Build dynamic SET clause
  const setClause = Object.keys(fields)
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');
  const values = Object.values(fields);

  try {
    const query = `UPDATE customer SET ${setClause} WHERE customerid = $${
      values.length + 1
    } RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a Customer
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM customer WHERE customerid = $1 RETURNING *",
      [id]
    ); // Use customerid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
