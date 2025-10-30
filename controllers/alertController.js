// controllers/alertController.js
const pool = require('../db');  // Assuming you have a database connection in db.js

// Function to handle GET request to get all alerts
const getAllAlerts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Alerts');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to handle POST request to create a new alert
const createAlert = async (req, res) => {
  console.log("Received Body:", req.body); // Debugging line
  
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty or missing" });
  }
  
  const { alerttype, affecteditemid, datetriggered, alertstatus, department } = req.body;

  if (!alerttype || !affecteditemid || !datetriggered || !alertstatus || !department) {
    return res.status(400).json({ error: "Missing required fields" }); //adding Debug Line
  }

  try {
    const result = await pool.query(
      'INSERT INTO Alerts (alerttype, affecteditemid, datetriggered, alertstatus, department) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [alerttype, affecteditemid, datetriggered, alertstatus, department]
    );
    console.log("Inserted Alert",result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// === Additional Alert Functions for Auto-Checks ===

// Check for low stock items and create alerts
const checkLowStockAlerts = async () => {
  try {
    const lowStockItems = await pool.query(`
      SELECT itemID, name FROM Inventory 
      WHERE demand < 10;
    `);
    

    for (const row of lowStockItems.rows) {
      await pool.query(`
        INSERT INTO Alerts (alertType, affectedItemID, dateTriggered, alertStatus, department)
        VALUES ('Low Stock', $1, CURRENT_DATE, 'Active', 'Inventory Control')
        ON CONFLICT DO NOTHING; -- Prevents duplicate alerts
      `, [row.itemid]);
    }
  } catch (err) {
    console.error('Low stock alert error:', err);
  }
};

// Check for expired inventory and create alerts
const checkExpiredInventoryAlerts = async () => {
  try {
    const expiredItems = await pool.query(`
      SELECT itemID FROM Inventory 
      WHERE expirationDate < CURRENT_DATE;
    `);

    for (const row of expiredItems.rows) {
      await pool.query(`
        INSERT INTO Alerts (alertType, affectedItemID, dateTriggered, alertStatus, department)
        VALUES ('Expired Inventory', $1, CURRENT_DATE, 'Active', 'Quality Assurance')
        ON CONFLICT DO NOTHING;
      `, [row.itemid]);
    }
  } catch (err) {
    console.error('Expired inventory alert error:', err);
  }
};

// Check for aged inventory and create alerts
const checkAgedInventoryAlerts = async () => {
  try {
    const agedItems = await pool.query(`
      SELECT itemID, name FROM Inventory 
      WHERE CURRENT_DATE - receivedDate > alertThresholdDays;
    `);
    

    for (const row of agedItems.rows) {
      await pool.query(`
        INSERT INTO Alerts (alertType, affectedItemID, dateTriggered, alertStatus, department)
        VALUES ('Aged Inventory', $1, CURRENT_DATE, 'Active', 'Inventory Control')
        ON CONFLICT DO NOTHING;
      `, [row.itemid]);
    }
  } catch (err) {
    console.error('Aged inventory alert error:', err);
  }
};

const runAllAlerts = async (req, res) => {
  let alertMessages = [];

  try {
// === LOW STOCK ALERTS WITH EOQ CALCULATION ===
const lowStockItems = await pool.query(`
  SELECT itemid, name, demand, orderingcost, holdingcostperyear FROM Inventory 
  WHERE demand < 10;
`);

for (const row of lowStockItems.rows) {
  const { demand, orderingcost, holdingcostperyear } = row;
  
  let eoq;
  if (demand && orderingcost && holdingcostperyear) {
    eoq = Math.sqrt((2 * demand * orderingcost) / holdingcostperyear);
  }

  await pool.query(`
    INSERT INTO Alerts (alerttype, affecteditemid, datetriggered, alertstatus, department)
    VALUES ('Low Stock', $1, CURRENT_DATE, 'Active', 'Inventory Control')
    ON CONFLICT DO NOTHING;
  `, [row.itemid]);

  if (eoq) {
    alertMessages.push(`⚠️ ${row.name} stock is low! We recommend ordering about ${Math.round(eoq)} units.`);
  } else {
    alertMessages.push(`⚠️ ${row.name} stock is low! Reorder suggestion not available.`);
  }
}

    // === EXPIRED INVENTORY ALERTS ===
    const expiredItems = await pool.query(`
      SELECT itemid, name FROM Inventory 
      WHERE expirationdate IS NOT NULL AND expirationdate < CURRENT_DATE;
    `);
    for (const row of expiredItems.rows) {
      await pool.query(`
        INSERT INTO Alerts (alerttype, affecteditemid, datetriggered, alertstatus, department)
        VALUES ('Expired Inventory', $1, CURRENT_DATE, 'Active', 'Quality Assurance')
        ON CONFLICT DO NOTHING;
      `, [row.itemid]);
      alertMessages.push(`${row.name} is expired!`);
    }

    // === AGED INVENTORY ALERTS ===
    const agedItems = await pool.query(`
      SELECT itemid, name FROM Inventory 
      WHERE CURRENT_DATE - receiveddate > alertthresholddays;
    `);
    for (const row of agedItems.rows) {
      await pool.query(`
        INSERT INTO Alerts (alerttype, affecteditemid, datetriggered, alertstatus, department)
        VALUES ('Aged Inventory', $1, CURRENT_DATE, 'Active', 'Inventory Control')
        ON CONFLICT DO NOTHING;
      `, [row.itemid]);
      alertMessages.push(`${row.name} has been on the shelf too long!`);
    }

    res.json({ alerts: alertMessages });

  } catch (err) {
    console.error('runAllAlerts error:', err);
    res.status(500).json({ error: 'Failed to run alert checks' });
  }
};

module.exports = {
  getAllAlerts,
  createAlert,
  checkLowStockAlerts,
  checkExpiredInventoryAlerts,
  checkAgedInventoryAlerts,
  runAllAlerts
};
