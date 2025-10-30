// routes/userAccountRouters.js
const express = require("express");
const router = express.Router();
const pool = require("../db"); // Assuming the database connection is in db.js

// Get all userAccounts
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM useraccount");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Account  by userid
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM useraccount WHERE userid = $1",
      [id]
    ); // Use userid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Account not found" });
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

  const { username, password, roles } = req.body;

  if (!username || !password || !roles) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO useraccount (username, password, roles ) VALUES ($1, $2, $3) RETURNING *",
      [username, password, roles] // Parameters passed as an array
    );
    console.log("Inserted New User", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
});

// Update a user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, roles } = req.body;

  console.log("Received Request Body:", req.body); // Debugging log

  if (!username || !password || !roles) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "UPDATE useraccount SET username = $1, password = $2, roles = $3 WHERE userid = $4 RETURNING *",
      [username, password, JSON.stringify(roles), id] // Correctly pass parameters as an array
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Partially update a user account
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  // Dynamically build the query based on fields provided
  const allowedFields = ['username', 'password', 'roles']; // Add other fields as necessary
  allowedFields.forEach((field, index) => {
    if (req.body[field] !== undefined) {
      fields.push(`${field} = $${fields.length + 1}`);
      values.push(field === "roles" ? JSON.stringify(req.body[field]) : req.body[field]); // Convert roles to JSON
    }
  });

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update' });
  }

  try {
    const query = `UPDATE useraccount SET ${fields.join(', ')} WHERE userid = $${fields.length + 1} RETURNING *`;
    values.push(id); // Add the id as the last parameter

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a User
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM useraccount WHERE userid = $1 RETURNING *",
      [id]
    ); // Use userid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
