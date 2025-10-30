const pool = require("../db"); // Assuming you have a database connection in db.js
const roles = require("../config/roles_list"); //Import roles
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
require("dotenv").config();
const fsPromises = require("fs").promises;
const path = require("path");

const handleLogin = async (req, res) => {
  console.log("handleLogin called"); // Debug log
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    // Query the database to find the user
    const result = await pool.query(
      "SELECT * FROM useraccount WHERE username = $1",
      [user]
    );
    const foundUser = result.rows[0]; // Get the first user from the query result

    if (!foundUser) {
      return res.sendStatus(401); // Unauthorized
    }

    // Evaluate the password
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
      const roles = foundUser.roles ? JSON.parse(foundUser.roles) : []; // Parse roles as JSON
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: roles, // Include roles in the token
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ accessToken, username: foundUser.username, roles: roles }); // Include roles in the response
    } else {
      res.sendStatus(401); // Unauthorized
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleRegister = async (req, res) => {
  const { username, password, repeatPassword } = req.body;

  console.log("Request body:", req.body); // Debug log

  // Validate input
  if (!username || !password || !repeatPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password !== repeatPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    // Check if the username already exists
    const userExists = await pool.query(
      "SELECT * FROM useraccount WHERE username = $1",
      [username]
    );
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "Username already exists." }); // Conflict
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(
      "Query:",
      "INSERT INTO useraccount (username, password, roles) VALUES ($1, $2, $3)"
    );
    console.log("Parameters:", [username, hashedPassword, roles.User]);

    // Insert the new user into the database
    await pool.query(
      "INSERT INTO useraccount (username, password, roles) VALUES ($1, $2, $3)",
      [username, hashedPassword, roles.User] // Default role is 'user'
    );

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { handleRegister, handleLogin };
