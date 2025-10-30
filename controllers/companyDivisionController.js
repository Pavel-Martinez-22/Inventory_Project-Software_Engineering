
// controllers companyDivisionController.js
const pool = require("../db"); // Assuming you have a database connection in db.js

// Function to handle GET request to get all companyDivisions
const getAllCompanyDivisions = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM companydivision");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to handle GET request to get a companyDivisions
const getCompanyDivision = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM companydivision WHERE divisionid = $1",
      [id]
    ); // Use divisionid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Division not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to handle POST request to create a new companyDivision
const createCompanyDivision = async (req, res) => {
  console.log("Received Body:", req.body); // Debugging line
  console.log("Request Headers:", req.headers); //Debugging
  console.log("Received Request Body:", req.body); // Debugging

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const { divisionname, manager } = req.body;

  if (!divisionname || !manager) {
    return res.status(400).json({ error: "Missing required fields" }); //adding Debug Line
  }

  try {
    const result = await pool.query(
      "INSERT INTO companydivision (divisionname, manager) VALUES ($1, $2) RETURNING *",
      [divisionname, manager]
    );
    console.log("Inserted Division", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to handle PUT request to update a companyDivision
const updateCompanyDivision = async (req, res) => {
  const { id } = req.params;
  const { divisionname, manager } = req.body;

  console.log("Received Request Body:", req.body); // Debugging log

  if (!divisionname || !manager) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "UPDATE companydivision SET divisionname = $1, manager = $2 WHERE divisionid = $3 RETURNING *",
      [divisionname, manager, id] // Correctly pass parameters as an array
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Division not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to handle DELETE request to delete a companyDivision
const deleteCompanyDivision = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM companydivision WHERE divisionid = $1 RETURNING *",
      [id]
    ); // Use divisionid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Division not found" });
    }
    res.json({ message: "Division deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllCompanyDivisions,
  getCompanyDivision,
  createCompanyDivision,
  updateCompanyDivision,
  deleteCompanyDivision,
};
