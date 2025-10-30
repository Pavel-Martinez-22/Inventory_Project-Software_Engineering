//Retrieve JSON information
document
  .getElementById("getOrder")
  .addEventListener("click", getOrder);

function getOrder() {
  let output = `Loading order...`;
  document.getElementById("output").innerHTML = output;

  fetch("/api/orders/")
    .then((res) => res.json())
    .then((data) => {
      // Create a table to display order data
      let output = `
        <h1>Orders</h1>
        <table border="1" class="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer ID</th>
              <th>Order Date</th>
              <th>Shipping Status</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Loop through the order data and create table rows
      data.forEach(function (order) {
        output += `
          <tr>
            <td>${order.orderid}</td>
            <td>${order.customerid}</td>
            <td>${order.orderdate}</td>
            <td>${order.shippingstatus}</td>
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
      console.error("Error fetching order:", error);
      document.getElementById("output").innerHTML =
        "<p style='color:red;'>Failed to load order data.</p>";
    });
}

//add new Order with POST

document
  .getElementById("orderForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const orderId = document.getElementById("orderid").value;

    const order = {
      orderid: document.getElementById("orderid").value,
      customerid: document.getElementById("customerid").value,
      orderdate: document.getElementById("orderdate").value,
      shippingstatus: document.getElementById("shippingstatus").value,
    };

    if (orderId) {
      // UPDATE existing order
      fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Updated: ${data.customerid} (ID: ${data.orderid})</p>`;
          document.getElementById("orderForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to update order.</p>`;
        });
    } else {
      // ADD new order
      fetch("/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Added: ${data.customerid} (ID: ${data.orderid})</p>`;
          document.getElementById("orderForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to add order.</p>`;
        });
    }
  });

//Delete product
document
  .getElementById("deleteOrderForm")
  .addEventListener("submit", deleteOrder);

function deleteOrder(e) {
  e.preventDefault();

  const deleteOrderId = document.getElementById("deleteOrderId").value;

  fetch(`/api/orders/${deleteOrderId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p>Deleted Order ID: ${deleteOrderId}</p>`;
        document.getElementById("deleteOrderForm");
        getOrder();
      } else {
        document.getElementById("deleteOrderForm").reset();
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p style="color:red;">Order ID: ${deleteOrderId}, does not exist</p>`;
        document.getElementById("deleteOrderForm");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById(
        "deleteResult"
      ).innerHTML = `<p style="color:red;">Failed to Delete order.</p>`;
    });
}

//PATCH update for specific fields
document.getElementById("patchBtn").addEventListener("click", function () {
  const orderId = document.getElementById("orderid").value;

  if (!orderId) {
    document.getElementById("postResult").innerHTML =
      "<p style='color:red;'>Order ID is required for PATCH updates.</p>";
    return;
  }

  // Build PATCH payload only with fields that have a value
  const patchPayload = {};

  const fields = ["customerid", "orderdate", "shippingstatus"];

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

  fetch(`/api/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update order.");
      return res.json();
    })
    .then((data) => {
      document.getElementById(
        "postResult"
      ).innerHTML = `<p>Updated: ${data.customerid} (ID: ${data.orderid})</p>`;
      getOrder();
    })
    .catch((error) => {
      console.error("Update Error:", error);
      document.getElementById(
        "postResult"
      ).innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
});
