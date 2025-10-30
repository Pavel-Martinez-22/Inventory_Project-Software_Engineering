//Retrieve JSON information
document
  .getElementById("getOrderItems")
  .addEventListener("click", getOrderItems);

function getOrderItems() {
  let output = `Loading Ordered Items...`;
  document.getElementById("output").innerHTML = output;

  fetch("/api/orderItems/")
    .then((res) => res.json())
    .then((data) => {
      // Create a table to display Order Item data
      let output = `
        <h1>Ordered Item</h1>
        <table border="1" class="orderItems-table">
          <thead>
            <tr>
              <th>Order Item ID</th>
              <th>Order ID</th>
              <th>Item ID</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Loop through the Order Items data and create table rows
      data.forEach(function (orderItems) {
        output += `
          <tr>
            <td>${orderItems.orderitemid}</td>
            <td>${orderItems.orderid}</td>
            <td>${orderItems.itemid}</td>
            <td>${orderItems.quantity}</td>
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
      console.error("Error fetching Order Items:", error);
      document.getElementById("output").innerHTML =
        "<p style='color:red;'>Failed to load Order Items data.</p>";
    });
}

//add new Order Items with POST

document
  .getElementById("orderItemsForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const orderItemId = document.getElementById("orderitemid").value;

    const orderItems = {
      orderitemid: document.getElementById("orderitemid").value,
      orderid: document.getElementById("orderid").value,
      itemid: document.getElementById("itemid").value,
      quantity: document.getElementById("quantity").value,
    };

    if (orderItemId) {
      // UPDATE existing Order Items
      fetch(`/api/orderItems/${orderItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderItems),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Updated: ${data.orderid} (ID: ${data.orderitemid})</p>`;
          document.getElementById("orderItemsForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to update Order Items.</p>`;
        });
    } else {
      // ADD new Order Items
      fetch("/api/orderItems/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderItems),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Added: ${data.orderid} (ID: ${data.orderitemid})</p>`;
          document.getElementById("orderItemsForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to add Order Items.</p>`;
        });
    }
  });

//Delete product
document
  .getElementById("deleteOrderItemsForm")
  .addEventListener("submit", deleteOrderItems);

function deleteOrderItems(e) {
  e.preventDefault();

  const deleteOrderItemsId = document.getElementById("deleteOrderItemsId").value;

  fetch(`/api/orderItems/${deleteOrderItemsId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p>Deleted Ordered Item ID: ${deleteOrderItemsId}</p>`;
        document.getElementById("deleteOrderItemsForm");
        getOrderItems();
      } else {
        document.getElementById("deleteOrderItemsForm").reset();
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p style="color:red;">Order Item ID: ${deleteOrderItemsId}, does not exist</p>`;
        document.getElementById("deleteOrderItemsForm");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById(
        "deleteResult"
      ).innerHTML = `<p style="color:red;">Failed to Delete Ordered Item.</p>`;
    });
}

//PATCH update for specific fields
document.getElementById("patchBtn").addEventListener("click", function () {
  const orderItemId = document.getElementById("orderitemid").value;

  if (!orderItemId) {
    document.getElementById("postResult").innerHTML =
      "<p style='color:red;'>Order Item ID is required for PATCH updates.</p>";
    return;
  }

  // Build PATCH payload only with fields that have a value
  const patchPayload = {};

  const fields = ["address", "capacity"];

  fields.forEach((field) => {
    const element = document.getElementById(field);
    let value = element.value;
    if (!isNaN(value) && element.type !== "text") {
      value =
        element.type === "number" || element.type === "date"
          ? Number(value)
          : value;
    }
    patchPayload[field] = value;
  });

  console.log("PATCH Payload:", patchPayload); // Debug log

  fetch(`/api/orderItems/${orderItemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update ordered items.");
      return res.json();
    })
    .then((data) => {
      document.getElementById(
        "postResult"
      ).innerHTML = `<p>Updated: ${data.orderid} (ID: ${data.orderitemid})</p>`;
      getOrderItems();
    })
    .catch((error) => {
      console.error("Update Error:", error);
      document.getElementById(
        "postResult"
      ).innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
});
