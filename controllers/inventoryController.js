// controllers/inventoryController.js

  const pool = require('../db');  // Janelle editing to update alerts logic 

// Function to handle GET request to get all inventory
const getAllInventory = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Inventory');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to handle POST request to create a new inventory
const createInventory = async (req, res) => {
  console.log("Received Body:", req.body); // Debugging line

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }

  const {
    name, sku, batchnumber, category, processedstatus,
    receiveddate, expirationdate, locationid, isperishable,
    shelflifedays, alertthresholddays, storagespacerequired,
    department, timestampreceived, demand, orderingcost, holdingcostperyear
  } = req.body;

  if ([
    name, sku, batchnumber, category, processedstatus, receiveddate,
    expirationdate, locationid, isperishable, shelflifedays,
    alertthresholddays, storagespacerequired, department,
    timestampreceived, demand, orderingcost, holdingcostperyear
  ].some(field => field === undefined || field === null)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Inventory (
        name, sku, batchnumber, category, processedstatus, receiveddate,
        expirationdate, locationid, isperishable, shelflifedays,
        alertthresholddays, storagespacerequired, department,
        timestampreceived, demand, orderingcost, holdingcostperyear
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *`,
      [
        name, sku, batchnumber, category, processedstatus, receiveddate,
        expirationdate, locationid, isperishable, shelflifedays,
        alertthresholddays, storagespacerequired, department,
        timestampreceived, demand, orderingcost, holdingcostperyear
      ]
    );

    const newItem = result.rows[0];
    console.log("Inserted Inventory", newItem);

    // === Alert Logic ===
    const currentDate = new Date();
    const recDate = new Date(newItem.receiveddate);
    const alertDays = newItem.alertthresholddays || 0;
    const shelfLife = newItem.shelflifedays || 0;

    const expiration = new Date(recDate);
    expiration.setDate(expiration.getDate() + shelfLife);

    const alertWindowStart = new Date(expiration);
    alertWindowStart.setDate(expiration.getDate() - alertDays);

    // Alert: Expiring Soon
    if (currentDate >= alertWindowStart && currentDate <= expiration) {
      await pool.query(
        `INSERT INTO Alerts (alerttype, affecteditemid, datetriggered, alertstatus, department)
         VALUES ($1, $2, CURRENT_DATE, $3, $4)`,
        ['Expiring Soon', newItem.itemid, 'Active', newItem.department]
      );
    }

    // Alert: Aged Inventory
    const ageInDays = Math.floor((currentDate - recDate) / (1000 * 60 * 60 * 24));
    if (ageInDays > alertDays) {
      await pool.query(
        `INSERT INTO Alerts (alerttype, affecteditemid, datetriggered, alertstatus, department)
         VALUES ($1, $2, CURRENT_DATE, $3, $4)`,
        ['Aged Inventory', newItem.itemid, 'Active', newItem.department]
      );
    }

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllInventory,
  createInventory
};
