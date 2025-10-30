//Retrieve JSON information
document
  .getElementById("getShipper")
  .addEventListener("click", getShipper);

function getShipper() {
  let output = `Loading shipper...`;
  document.getElementById("output").innerHTML = output;

  fetch("/api/shippers/")
    .then((res) => res.json())
    .then((data) => {
      // Check if there are no shippers
      if (data.length === 0) {
        document.getElementById("output").innerHTML =
          "<p>No shippers available.</p>";
        return;
      }
      // Create a table to display shipper data
      let output = `
        <h1>Shippers</h1>
        <table border="1" class="shipping-table">
          <thead>
            <tr>
              <th>Shipping ID</th>
              <th>Carrier Name</th>
              <th>Tracking Number</th>
              <th>Vendor ID</th>
              <th>Estimated Delivery Date</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Loop through the shipper data and create table rows
      data.forEach(function (shipping) {
        output += `
          <tr>
            <td>${shipping.shippingid}</td>
            <td>${shipping.carriername}</td>
            <td>${shipping.trackingnumber}</td>
            <td>${shipping.vendorid}</td>
            <td>${shipping.estimateddeliverydate}</td>
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
      console.error("Error fetching shipper:", error);
      document.getElementById("output").innerHTML =
        "<p style='color:red;'>Failed to load shipper data.</p>";
    });
}

//add new shipper with POST

document
  .getElementById("shippingForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const shippingId = document.getElementById("shippingid").value;

    const shipping = {
      shippingid: document.getElementById("shippingid").value,
      carriername: document.getElementById("carriername").value,
      trackingnumber: document.getElementById("trackingnumber").value,
      vendorid: document.getElementById("vendorid").value,
      estimateddeliverydate: document.getElementById("estimateddeliverydate").value,
    };

    if (shippingId) {
      // UPDATE existing shipper
      fetch(`/api/shippers/${shippingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shipping),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Updated: ${data.carriername} (ID: ${data.shippingid})</p>`;
          document.getElementById("shippingForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to update shipper.</p>`;
        });
    } else {
      // ADD new shipper
      fetch("/api/shippers/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shipping),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Added: ${data.carriername} (ID: ${data.shippingid})</p>`;
          document.getElementById("shippingForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to add shipper.</p>`;
        });
    }
  });

//Delete product
document
  .getElementById("deleteShippingForm")
  .addEventListener("submit", deleteShipping);

function deleteShipping(e) {
  e.preventDefault();

  const deleteShippingId = document.getElementById("deleteShippingId").value;

  fetch(`/api/shippers/${deleteShippingId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p>Deleted shipping ID: ${deleteShippingId}</p>`;
        document.getElementById("deleteShippingForm");
        getShipper();
      } else {
        document.getElementById("deleteShippingForm").reset();
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p style="color:red;">Shipping ID: ${deleteShippingId}, does not exist</p>`;
        document.getElementById("deleteShippingForm");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById(
        "deleteResult"
      ).innerHTML = `<p style="color:red;">Failed to Delete shipper.</p>`;
    });
}

//PATCH update for specific fields
document.getElementById("patchBtn").addEventListener("click", function () {
  const shippingId = document.getElementById("shippingid").value;

  if (!shippingId) {
    document.getElementById("postResult").innerHTML =
      "<p style='color:red;'>Shipping ID is required for PATCH updates.</p>";
    return;
  }

  // Build PATCH payload only with fields that have a value
  const patchPayload = {};

  const fields = ["carriername", "trackingnumber", "vendorid", "estimateddeliverydate"];


 fields.forEach((field) => {
    const element = document.getElementById(field);
    let value = element.value.trim(); //add trim

    //add more logic to support css update issue
    if (field === "estimateddeliverydate") {
      if (!value || isNaN(Date.parse(value))) {
        patchPayload[field] = null;
      } else {
        patchPayload[field] = value;
      }
    } else if (value !== "") {
      patchPayload[field] = value;
    }
  });

  console.log("PATCH Payload:", patchPayload); // Debug log

  fetch(`/api/shippers/${shippingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update shipper.");
      return res.json();
    })
    .then((data) => {
      document.getElementById(
        "postResult"
      ).innerHTML = `<p>Updated: ${data.carriername} (ID: ${data.shippingid})</p>`;
      getShipper();
    })
    .catch((error) => {
      console.error("Update Error:", error);
      document.getElementById(
        "postResult"
      ).innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
});
