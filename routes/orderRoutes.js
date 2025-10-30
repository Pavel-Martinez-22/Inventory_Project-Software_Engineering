// routes/orderRouters.js
const express = require("express");
const router = express.Router();
const pool = require("../db"); // Assuming the database connection is in db.js

// Get all customers
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Order by orderid
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM orders WHERE orderid = $1", [
      id,
    ]); // Use orderid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new order
router.post("/", async (req, res) => {
  console.log("Request Headers:", req.headers); //Debugging
  console.log("Received Request Body:", req.body); // Debugging

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const { customerid, orderdate, shippingstatus } = req.body;

  if (!customerid || !orderdate || !shippingstatus) {
    return res.status(400).json({ error: "Missing required fields" });
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
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
});

// Update a order
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { customerid, orderdate, shippingstatus } = req.body;

  console.log("Received Request Body:", req.body); // Debugging log

  if (!customerid || !orderdate || !shippingstatus) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "UPDATE orders SET customerid = $1, orderdate = $2, shippingstatus = $3 WHERE orderid = $4 RETURNING *",
      [customerid, orderdate, shippingstatus, id] // Correctly pass parameters as an array
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Partially update an order
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  if (!fields || Object.keys(fields).length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  // Build dynamic SET clause
  const setClause = Object.keys(fields)
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");
  const values = Object.values(fields);

  try {
    const query = `UPDATE orders SET ${setClause} WHERE orderid = $${values.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a order
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM orders WHERE orderid = $1 RETURNING *",
      [id]
    ); // Use orderid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
