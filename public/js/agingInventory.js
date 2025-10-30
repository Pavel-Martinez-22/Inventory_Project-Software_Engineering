//Retrieve JSON information
document
  .getElementById("getAgingInventory")
  .addEventListener("click", getAgingInventory);

function getAgingInventory() {
  let output = `Loading Aging Inventory...`;
  document.getElementById("output").innerHTML = output;

  fetch("/api/aginginventory")
    .then((res) => res.json())
    .then((data) => {
      // Create a table to display Aging Inventory data
      let output = `
        <h1>Aging Inventory</h1>
        <table border="1" class="Aging-Inventory-table">
          <thead>
            <tr>
              <th>Aging ID</th>
              <th>Item ID</th>
              <th>Aging Date</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Loop through the Aging Inventory data and create table rows
      data.forEach(function (agingInventory) {
        output += `
          <tr>
            <td>${agingInventory.agingid}</td>
            <td>${agingInventory.itemid}</td>
            <td>${agingInventory.agingdate}</td>
            <td>${agingInventory.quantity}</td>
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
      console.error("Error fetching aging inventory:", error);
      document.getElementById("output").innerHTML =
        "<p style='color:red;'>Failed to load aging inventory data.</p>";
    });
}

//add new Aging Inventory with POST

document
  .getElementById("agingInventoryForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const agingId = document.getElementById("agingid").value;

    const agingInventory = {
      agingid: document.getElementById("agingid").value,
      itemid: document.getElementById("itemid").value,
      agingdate: document.getElementById("agingdate").value,
      quantity: document.getElementById("quantity").value,
    };

    if (agingId) {
      // UPDATE existing aging inventory
      fetch(`/api/aginginventory/${agingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agingInventory),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Updated: ${data.itemid} (ID: ${data.agingid})</p>`;
          document.getElementById("agingInventoryForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to update aging id.</p>`;
        });
    } else {
      // ADD new aging id
      fetch("/api/aginginventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agingInventory),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Added: ${data.itemid} (ID: ${data.agingid})</p>`;
          document.getElementById("agingInventoryForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to add aging id.</p>`;
        });
    }
  });

//Delete product
document
  .getElementById("deleteAgingForm")
  .addEventListener("submit", deleteAging);

function deleteAging(e) {
  e.preventDefault();

  const deleteAgingId = document.getElementById("deleteAgingId").value;

  fetch(`/api/aginginventory/${deleteAgingId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p>Deleted Aging ID: ${deleteAgingId}</p>`;
        document.getElementById("deleteAgingForm");
        getAgingInventory();
      } else {
        document.getElementById("deleteAgingForm").reset();
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p style="color:red;">Aging ID: ${deleteAgingId}, does not exist</p>`;
        document.getElementById("deleteAgingForm");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById(
        "deleteResult"
      ).innerHTML = `<p style="color:red;">Failed to Delete aging item.</p>`;
    });
}

//PATCH update for specific fields
document.getElementById("patchBtn").addEventListener("click", function () {
  const agingId = document.getElementById("agingid").value;

  if (!agingId) {
    document.getElementById("postResult").innerHTML =
      "<p style='color:red;'>Aging ID is required for PATCH updates.</p>";
    return;
  }

  // Build PATCH payload only with fields that have a value
  const patchPayload = {};

  const fields = ["agingdate", "quantity"];

  fields.forEach((field) => {
    const element = document.getElementById(field);
    let value = element.value;
    if (!isNaN(value) && element.type !== "text") {
      value =
        element.type === "number" || element.type === "date" || element.type === "current_date"
          ? Number(value)
          : value;
    }
    patchPayload[field] = value;
  });

  console.log("PATCH Payload:", patchPayload); // Debug log

  fetch(`/api/aginginventory/${agingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update aging item.");
      return res.json();
    })
    .then((data) => {
      document.getElementById(
        "postResult"
      ).innerHTML = `<p>Updated: ${data.itemid} (ID: ${data.agingid})</p>`;
      getAgingInventory();
    })
    .catch((error) => {
      console.error("Update Error:", error);
      document.getElementById(
        "postResult"
      ).innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
});
