//Retrieve JSON information

document.getElementById("getInventory").addEventListener("click", getInventory);

  function getInventory() {
    let output = `Loading Inventory...`;
    document.getElementById("output").innerHTML = output;
  
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        // Create a table to display inventory data
        let output = `
          <h1>Inventory</h1>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <table border="1" class="inventory-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Batch Number</th>
                <th>Category</th>
                <th>Processed Status</th>
                <th>Received Date</th>
                <th>Expiration Date</th>
                <th>Location ID</th>
                <th>Is Perishable</th>
                <th>Shelf-life Days</th>
                <th>Alert Threshold Days</th>
                <th>Storage Space Required</th>
                <th>Department</th>
                <th>Timestamp Received</th>
                <th>Demand</th>
                <th>Ordering Cost</th>
                <th>Holding Cost Per Year</th>
              </tr>
            </thead>
            <tbody>
        `;
  
        // Loop through the inventory data and create table rows
        data.forEach(function (inventory) {
          output += `
            <tr>
              <td>${inventory.itemid}</td>
              <td>${inventory.name}</td>
              <td>${inventory.sku}</td>
              <td>${inventory.batchnumber}</td>
              <td>${inventory.category}</td>
              <td>${inventory.processedstatus}</td>
              <td>${inventory.receiveddate}</td>
              <td>${inventory.expirationdate || "N/A"}</td>
              <td>${inventory.locationid}</td>
              <td>${inventory.isperishable ? "Yes" : "No"}</td>
              <td>${inventory.shelflifedays}</td>
              <td>${inventory.alertthresholddays}</td>
              <td>${inventory.storagespacerequired}</td>
              <td>${inventory.department}</td>
              <td>${inventory.timestampreceived || "N/A"}</td>
              <td>${inventory.demand}</td>
              <td>${inventory.orderingcost}</td>
              <td>${inventory.holdingcostperyear}</td>
            </tr>
          `;
        });
  
        output += `
            </tbody>
          </table>
        `;
  
        document.getElementById("output").innerHTML = output;
      })
      .catch((error) => {
        console.error("Error fetching inventory:", error);
        document.getElementById("output").innerHTML =
          "<p style='color:red;'>Failed to load inventory data.</p>";
      });
  }

//add new inventory item with POST
//updated to update item with PUT

document
  .getElementById("inventoryForm").addEventListener("submit", function (event) {event.preventDefault();

    const itemId = document.getElementById("itemid").value;

    const inventoryItem = {
      name: document.getElementById("name").value,
      sku: document.getElementById("sku").value,
      batchnumber: document.getElementById("batchnumber").value,
      category: document.getElementById("category").value,
      processedstatus: document.getElementById("processedstatus").value,
      receiveddate: document.getElementById("receiveddate").value,
      expirationdate: document.getElementById("expirationdate").value || null,
      locationid: parseInt(document.getElementById("locationid").value),
      isperishable: document.getElementById("isperishable").value === "true",
      shelflifedays: parseInt(document.getElementById("shelflifedays").value),
      alertthresholddays: parseInt(document.getElementById("alertthresholddays").value),
      storagespacerequired: parseInt(document.getElementById("storagespacerequired").value),
      department: document.getElementById("department").value,timestampreceived:
        document.getElementById("timestampreceived").value || null,
      demand: parseInt(document.getElementById("demand").value),
      orderingcost: parseFloat(document.getElementById("orderingcost").value),
      holdingcostperyear: parseFloat(document.getElementById("holdingcostperyear").value),
    };

    if (itemId) {
      // UPDATE existing inventory item
      fetch(`/api/inventory/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventoryItem),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Updated: ${data.name} (ID: ${data.itemid})</p>`;
          document.getElementById("inventoryForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to update item.</p>`;
        });
    } else {
      // ADD new inventory item
      fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventoryItem),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Added: ${data.name} (ID: ${data.itemid})</p>`;
          document.getElementById("inventoryForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to add item.</p>`;
        });
    }
  });

//Delete product
document
  .getElementById("deleteInventoryForm")
  .addEventListener("submit", deleteInventory);

function deleteInventory(e) {
  e.preventDefault();

  const deleteItemID = document.getElementById("deleteItemID").value;

  fetch(`/api/inventory/${deleteItemID}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p>Deleted Product Item ID: ${deleteItemID}</p>`;
        document.getElementById("deleteInventoryForm");
        getInventory();
      } else {
        document.getElementById("deleteInventoryForm").reset();
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p style="color:red;">Product Item ID: ${deleteItemID}, does not exist</p>`;
        document.getElementById("deleteInventoryForm");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById(
        "deleteResult"
      ).innerHTML = `<p style="color:red;">Failed to DELETE item.</p>`;
    });
}

//PATCH update for specific fields
document.getElementById("patchBtn").addEventListener("click", function () {
  const itemId = document.getElementById("itemid").value;

  if (!itemId) {
    document.getElementById("postResult").innerHTML =
      "<p style='color:red;'>Item ID is required for PATCH updates.</p>";
    return;
  }

  // Build PATCH payload only with fields that have a value
  const patchPayload = {};

  const fields = [
    "name", "sku", "batchnumber", "category", "processedstatus", "receiveddate",
    "expirationdate", "locationid", "isperishable", "shelflifedays",
    "alertthresholddays", "storagespacerequired", "department",
    "timestampreceived", "demand", "orderingcost", "holdingcostperyear"
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field);
    let value = element.value;

    if (value !== "") {
      if (field === "isperishable") {
        value = value === "true";
      } else if (!isNaN(value) && element.type !== "text") {
        value = element.type === "number" || element.type === "date" ? Number(value) : value;
      }
      patchPayload[field] = value;
    }
  });

  fetch(`/api/inventory/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to Update item.");
      return res.json();
    })
    .then((data) => {
      document.getElementById(
        "postResult"
      ).innerHTML = `<p>Updated: ${data.name} (ID: ${data.itemid})</p>`;
      getInventory();
    })
    .catch((error) => {
      console.error("Update Error:", error);
      document.getElementById(
        "postResult"
      ).innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
});

// === ALERTS SECTION ===
// Button click to fetch alerts and display them //Janelle added for testing
document.getElementById("getAlerts").addEventListener("click", async () => {
  const outputDiv = document.getElementById("alertsOutput");
  outputDiv.innerHTML = "<p>Running alert checks...</p>";

  try {
    // STEP 1: Run all alert logic (low stock, aged, expired)
    await fetch("/api/alerts/run-checks");

    // STEP 2: Fetch updated alerts from the database
    const response = await fetch("/api/alerts");
    const alerts = await response.json();

    // STEP 3: Display them
    if (!alerts.length) {
      outputDiv.innerHTML = "<p>No active alerts.</p>";
      return;
    }

    outputDiv.innerHTML = alerts.map(alert => `
      <div class="alert-box">
        <strong>${alert.alerttype}</strong> — Item ID: ${alert.affecteditemid}<br/>
        Status: ${alert.alertstatus} | Dept: ${alert.department}<br/>
        Triggered on: ${new Date(alert.datetriggered).toLocaleDateString()}
      </div>
      <hr/>
    `).join('');
  } catch (err) {
    console.error("Error running or fetching alerts:", err);
    outputDiv.innerHTML = "<p style='color:red;'>Failed to get alerts.</p>";
  }
});

// Button click to clear all alerts from the database //Janelle added for testing
document.getElementById("clearAlerts").addEventListener("click", async () => {
  const confirmed = confirm("Are you sure you want to delete all alerts?");
  if (!confirmed) return;

  try {
    const res = await fetch("/api/alerts", {
      method: "DELETE"
    });

    if (res.ok) {
      document.getElementById("clearAlertsOutput").innerHTML =
        "<p> All alerts have been cleared.</p>";
      console.log("Alerts cleared.");
    } else {
      throw new Error("Failed to delete alerts.");
    }
  } catch (err) {
    console.error("Error clearing alerts:", err);
    document.getElementById("clearAlertsOutput").innerHTML =
      "<p style='color:red;'> Error clearing alerts.</p>";
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/alerts/run-checks');
    const data = await response.json();

    // If alert messages are returned, show the modal
    if (data && data.alerts && data.alerts.length > 0) {
      showAlertModal(data.alerts);
    }
  } catch (err) {
    console.error('Failed to fetch alerts:', err);
  }
});

function showAlertModal(alerts) {
  const modal = document.getElementById('alertModal');
  const alertList = document.getElementById('alertList');

  alertList.innerHTML = ''; // Clear any old alerts
  alerts.forEach(alert => {
    const li = document.createElement('li');
    li.textContent = alert;
    alertList.appendChild(li);
  });

  modal.style.display = 'block';
}

function closeAlertModal() {
  document.getElementById('alertModal').style.display = 'none';
}
