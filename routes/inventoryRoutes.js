// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');  // Assuming the database connection is in db.js

// Get all inventory items
router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM Inventory');
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
// Get inventory by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM Inventory WHERE itemid= $1', [id]);  // Use itemid for primary key
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Create a new inventory item
router.post('/', async (req, res) => {
  console.log("Request Headers:", req.headers); //Debugging
  console.log("Received Request Body:", req.body); // Debugging
  console.log("Keys in Received Request:", Object.keys(req.body)); //more debugging

  const requiredFields = [
    "name", "sku", "batchnumber", "category", "processedstatus",
    "receiveddate", "expirationdate", "locationid", "isperishable",
    "shelflifedays", "alertthresholddays", "storagespacerequired",
    "department", "timestampreceived", "demand", "orderingcost", "holdingcostperyear"
  ];

  const missingFields = requiredFields.filter(field => req.body[field] === undefined); //added more debugging due to missing required fields failure

  if (missingFields.length > 0) {
    console.log("Missing Fields:", missingFields); // Debugging
    return res.status(400).json({ error: "Missing required fields", missingFields });
  }

  const { name, sku, batchnumber, category, processedstatus, receiveddate, expirationdate, locationid, isperishable, shelflifedays, alertthresholddays, storagespacerequired, department, timestampreceived, demand, orderingcost, holdingcostperyear } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO inventory (name, sku, batchnumber, category, processedstatus, receiveddate, expirationdate, locationid, isperishable, shelflifedays, alertthresholddays, storagespacerequired, department, timestampreceived, demand, orderingcost, holdingcostperyear) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [name, sku, batchnumber, category, processedstatus, receiveddate, expirationdate, locationid, isperishable, shelflifedays, alertthresholddays, storagespacerequired, department, timestampreceived || new Date(), demand, orderingcost, holdingcostperyear]
    );

    console.log("Inserted Inventory", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }

// tested with this POST
// {
 //   "name": "paper",
//    "sku": "SKU99999",
//    "batchnumber": "B999",
//    "category": "Office Supplies",
//    "processedstatus": "received",
//    "receiveddate": "2025-03-29",
//    "expirationdate": null,
//    "locationid": 1,
//    "isperishable": false,
//    "shelflifedays": 0,
//    "alertthresholddays": 30,
//    "storagespacerequired": 40,
//    "department": "Office Supplies",
//    "timestampreceived": null,
//    "demand": 0,
//   "orderingcost": 1.23,
//    "holdingcostperyear": 6.54
//  }


});

// Update an inventory item
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  
  const fields = req.body;

  if (!id) {
    return res.status(400).json({ error: "Missing item ID" });
  }

  // Ensure at least one field is being updated
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  // Build SET clause dynamically
  const setClauses = keys.map((key, idx) => `${key} = $${idx + 1}`);
  const values = Object.values(fields);

  const query = `
    UPDATE inventory
    SET ${setClauses.join(', ')}
    WHERE itemid = $${keys.length + 1}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Delete an inventory item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Inventory WHERE itemid = $1 RETURNING *', [id]);  // Use itemid for primary key
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory Item not found' });
    }
    res.json({ message: 'Inventory item deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  



  module.exports = router;