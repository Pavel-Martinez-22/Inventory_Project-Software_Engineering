//Retrieve JSON information
document.getElementById("getVendor").addEventListener("click", getVendor);

  function getVendor() {
    let output = `Loading vendor...`;
    document.getElementById("output").innerHTML = output;
  
    fetch("/api/vendors")
    .then((res) => res.json())
      .then((data) => {
        // Create a table to display vendor data
        let output = `
          <h1>Vendors</h1>
          <table border="1" class="vendor-table">
            <thead>
              <tr>
                <th>Vendor Id</th>
                <th>Vendor Name</th>
                <th>Contact Info</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
        `;
  
        // Loop through the vendor data and create table rows
          data.forEach(function (vendor) {
          output += `
            <tr>
              <td>${vendor.vendorid}</td>
              <td>${vendor.vendorname}</td>
              <td>${vendor.contactinfo}</td>
              <td>${vendor.address}</td>
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
        console.error("Error fetching vendor:", error);
        document.getElementById("output").innerHTML =
          "<p style='color:red;'>Failed to load vendor data.</p>";
      });
  }  

//add new vendor with POST

document.getElementById("vendorForm").addEventListener("submit", function (event) {event.preventDefault();

  const vendorId = document.getElementById("vendorid").value;

  const vendorItem = {
    vendorname: document.getElementById("vendorname").value,
    contactinfo: document.getElementById("contactinfo").value,
    address: document.getElementById("address").value,
  };
/*
  fetch("/api/vendors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(vendors)
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById("postResult").innerHTML = `<p>Vendor Added: ${data.vendorname} (ID: ${data.vendorid})</p>`;
      document.getElementById("vendorForm").reset();
    })
    .catch(error => {
      console.error("Error:", error);
      document.getElementById("postResult").innerHTML = `<p style="color:red;">Failed to add item.</p>`;
    });
});
*/
if (vendorId) {
      // UPDATE existing vendor
      fetch(`/api/vendors/${vendorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorItem),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Updated: ${data.vendorname} (ID: ${data.vendorid})</p>`;
          document.getElementById("vendorForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to update vendor.</p>`;
        });
    } else {
      // ADD new vendor
      fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorItem),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Added: ${data.vendorname} (ID: ${data.vendorid})</p>`;
          document.getElementById("vendorForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to add vendor.</p>`;
        });
    }
  });

//Delete product
document
  .getElementById("deleteVendorForm")
  .addEventListener("submit", deleteVendor);

function deleteVendor(e) {
  e.preventDefault();

  const deleteVendorid = document.getElementById("deleteVendorid").value;

  fetch(`/api/vendors/${deleteVendorid}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p>Deleted Vendor ID: ${deleteVendorid}</p>`;
        document.getElementById("deleteVendorForm");
        getVendor();
      } else {
        document.getElementById("deleteVendorForm").reset();
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p style="color:red;">Vendor ID: ${deleteVendorid}, does not exist</p>`;
        document.getElementById("deleteVendorForm");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById(
        "deleteResult"
      ).innerHTML = `<p style="color:red;">Failed to DELETE vendor.</p>`;
    });
}

//PATCH update for specific fields
document.getElementById("patchBtn").addEventListener("click", function () {
  const vendorId = document.getElementById("vendorid").value;

  if (!vendorId) {
    document.getElementById("postResult").innerHTML =
      "<p style='color:red;'>Vendor ID is required for PATCH updates.</p>";
    return;
  }

  // Build PATCH payload only with fields that have a value
  const patchPayload = {};

  const fields = [
    "vendorname", "contactinfo", "address"
  ];

  fields.forEach((field) => {
    const element = document.getElementById(field);
    let value = element.value;
    if (!isNaN(value) && element.type !== "text") {
      value = element.type === "number" || element.type === "date" ? Number(value) : value;
    }
    patchPayload[field] = value;
  
  });

  console.log("PATCH Payload:", patchPayload); // Debug log

  fetch(`/api/vendors/${vendorId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update vendor.");
      return res.json();
    })
    .then((data) => {
      document.getElementById(
        "postResult"
      ).innerHTML = `<p>Updated: ${data.vendorname} (ID: ${data.vendorid})</p>`;
      getVendor();
    })
    .catch((error) => {
      console.error("Update Error:", error);
      document.getElementById(
        "postResult"
      ).innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
});