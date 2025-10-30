const pool = require("../db"); // Database connection

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM useraccount");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* // Create a new user
const createNewUser = async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password || !roles) {
    return res.status(400).json({ error: "Username, password, and roles are required." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO useraccount (username, password, roles) VALUES ($1, $2, $3) RETURNING *",
      [username, password, JSON.stringify(roles)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}; */

// Update a user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, roles } = req.body;

  if (!username || !password || !roles) {
    return res.status(400).json({ error: "Username, password, and roles are required." });
  }

  try {
    const result = await pool.query(
      "UPDATE useraccount SET username = $1, password = $2, roles = $3 WHERE id = $4 RETURNING *",
      [username, password, JSON.stringify(roles), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM useraccount WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a single user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM useraccount WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  getUserById,
};