//Retrieve JSON information
document
  .getElementById("getLocation")
  .addEventListener("click", getLocation);

function getLocation() {
  let output = `Loading location...`;
  document.getElementById("output").innerHTML = output;

  fetch("/api/locations/")
    .then((res) => res.json())
    .then((data) => {
      // Create a table to display location data
      let output = `
        <h1>Locations</h1>
        <table border="1" class="location-table">
          <thead>
            <tr>
              <th>Location ID</th>
              <th>Customer ID</th>
              <th>Address</th>
              <th>Capacity</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Loop through the location data and create table rows
      data.forEach(function (location) {
        output += `
          <tr>
            <td>${location.locationid}</td>
            <td>${location.customerid}</td>
            <td>${location.address}</td>
            <td>${location.capacity}</td>
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
      console.error("Error fetching location:", error);
      document.getElementById("output").innerHTML =
        "<p style='color:red;'>Failed to load location data.</p>";
    });
}

//add new location with POST

document
  .getElementById("locationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const locationId = document.getElementById("locationid").value;

    const location = {
      locationid: document.getElementById("locationid").value,
      customerid: document.getElementById("customerid").value,
      address: document.getElementById("address").value,
      capacity: document.getElementById("capacity").value,
    };

    if (locationId) {
      // UPDATE existing location
      fetch(`/api/locations/${locationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Updated: ${data.customerid} (ID: ${data.locationid})</p>`;
          document.getElementById("locationForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to update location.</p>`;
        });
    } else {
      // ADD new location
      fetch("/api/locations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Added: ${data.address} (ID: ${data.locationid})</p>`;
          document.getElementById("locationForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to add location.</p>`;
        });
    }
  });

//Delete product
document
  .getElementById("deleteLocationForm")
  .addEventListener("submit", deleteLocation);

function deleteLocation(e) {
  e.preventDefault();

  const deleteLocationId = document.getElementById("deleteLocationId").value;

  fetch(`/api/locations/${deleteLocationId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p>Deleted location ID: ${deleteLocationId}</p>`;
        document.getElementById("deleteLocationForm");
        getLocation();
      } else {
        document.getElementById("deleteLocationForm").reset();
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p style="color:red;">Location ID: ${deleteLocationId}, does not exist</p>`;
        document.getElementById("deleteLocationForm");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById(
        "deleteResult"
      ).innerHTML = `<p style="color:red;">Failed to Delete location.</p>`;
    });
}

//PATCH update for specific fields
document.getElementById("patchBtn").addEventListener("click", function () {
  const locationId = document.getElementById("locationid").value;

  if (!locationId) {
    document.getElementById("postResult").innerHTML =
      "<p style='color:red;'>Location ID is required for PATCH updates.</p>";
    return;
  }

  // Build PATCH payload only with fields that have a value
  const patchPayload = {};

  const fields = ["customerid", "address", "capacity"];

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

  fetch(`/api/locations/${locationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update location.");
      return res.json();
    })
    .then((data) => {
      document.getElementById(
        "postResult"
      ).innerHTML = `<p>Updated: ${data.address} (ID: ${data.locationid})</p>`;
      getLocation();
    })
    .catch((error) => {
      console.error("Update Error:", error);
      document.getElementById(
        "postResult"
      ).innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
});
