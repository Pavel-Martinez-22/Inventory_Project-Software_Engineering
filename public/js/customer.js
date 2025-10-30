//Retrieve JSON information
document
  .getElementById("getCustomer")
  .addEventListener("click", getCustomer);

function getCustomer() {
  let output = `Loading customer...`;
  document.getElementById("output").innerHTML = output;

  fetch("/api/customers/")
    .then((res) => res.json())
    .then((data) => {
      // Create a table to display customer data
      let output = `
        <h1>Customer</h1>
        <table border="1" class="customer-table">
          <thead>
            <tr>
              <th>Customer Id</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Loop through the customer data and create table rows
      data.forEach(function (customer) {
        output += `
          <tr>
            <td>${customer.customerid}</td>
            <td>${customer.customername}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.address}</td>
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
      console.error("Error fetching customer:", error);
      document.getElementById("output").innerHTML =
        "<p style='color:red;'>Failed to load customer data.</p>";
    });
}

//add new Customer Name with POST

document
  .getElementById("customerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const customerId = document.getElementById("customerid").value;

    const customer = {
      customerid: document.getElementById("customerid").value,
      customername: document.getElementById("customername").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
    };

    if (customerId) {
      // UPDATE existing customer
      fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Updated: ${data.customername} (ID: ${data.customerid})</p>`;
          document.getElementById("customerForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to update customer.</p>`;
        });
    } else {
      // ADD new customer
      fetch("/api/customers/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Added: ${data.customername} (ID: ${data.customerid})</p>`;
          document.getElementById("customerForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to add customer.</p>`;
        });
    }
  });

//Delete product
document
  .getElementById("deleteCustomerForm")
  .addEventListener("submit", deleteCustomer);

function deleteCustomer(e) {
  e.preventDefault();

  const deleteCustomerId = document.getElementById("deleteCustomerId").value;

  fetch(`/api/customers/${deleteCustomerId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p>Deleted Customer ID: ${deleteCustomerId}</p>`;
        document.getElementById("deleteCustomerForm");
        getCustomer();
      } else {
        document.getElementById("deleteCustomerForm").reset();
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p style="color:red;">Customer ID: ${deleteCustomerId}, does not exist</p>`;
        document.getElementById("deleteCustomerForm");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById(
        "deleteResult"
      ).innerHTML = `<p style="color:red;">Failed to Delete customer.</p>`;
    });
}

//PATCH update for specific fields
document.getElementById("patchBtn").addEventListener("click", function () {
  const customerId = document.getElementById("customerid").value;

  if (!customerId) {
    document.getElementById("postResult").innerHTML =
      "<p style='color:red;'>Customer ID is required for PATCH updates.</p>";
    return;
  }

  // Build PATCH payload only with fields that have a value
  const patchPayload = {};

  const fields = ["customername", "email", "phone", "address"];

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

  fetch(`/api/customers/${customerId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update customer.");
      return res.json();
    })
    .then((data) => {
      document.getElementById(
        "postResult"
      ).innerHTML = `<p>Updated: ${data.customername} (ID: ${data.customerid})</p>`;
      getCustomer();
    })
    .catch((error) => {
      console.error("Update Error:", error);
      document.getElementById(
        "postResult"
      ).innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
});
