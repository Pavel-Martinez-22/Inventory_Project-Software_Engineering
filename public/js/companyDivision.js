//Retrieve JSON information
document
  .getElementById("getCompanyDivision")
  .addEventListener("click", getCompanyDivision);

function getCompanyDivision() {
  let output = `Loading company division...`;
  document.getElementById("output").innerHTML = output;

  fetch("/api/companyDivisions/")
    .then((res) => res.json())
    .then((data) => {
      // Create a table to display company division data
      let output = `
        <h1>Company Division</h1>
        <table border="1" class="company-division-table">
          <thead>
            <tr>
              <th>Division Id</th>
              <th>Division Name</th>
              <th>Manager</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Loop through the company division data and create table rows
      data.forEach(function (companyDivision) {
        output += `
          <tr>
            <td>${companyDivision.divisionid}</td>
            <td>${companyDivision.divisionname}</td>
            <td>${companyDivision.manager}</td>
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
      console.error("Error fetching company division:", error);
      document.getElementById("output").innerHTML =
        "<p style='color:red;'>Failed to load company division data.</p>";
    });
}

//add new Company Division Name with POST

document
  .getElementById("companyDivisionForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const divisionId = document.getElementById("divisionid").value;

    const companyDivision = {
      divisionid: document.getElementById("divisionid").value,
      divisionname: document.getElementById("divisionname").value,
      manager: document.getElementById("manager").value,
    };

    if (divisionId) {
      // UPDATE existing division
      fetch(`/api/companyDivisions/${divisionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyDivision),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Updated: ${data.divisionname} (ID: ${data.divisionid})</p>`;
          document.getElementById("companyDivisionForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to update division.</p>`;
        });
    } else {
      // ADD new division
      fetch("/api/companyDivisions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyDivision),
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById(
            "postResult"
          ).innerHTML = `<p>Added: ${data.divisionname} (ID: ${data.divisionid})</p>`;
          document.getElementById("companyDivisionForm").reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById(
            "postResult"
          ).innerHTML = `<p style="color:red;">Failed to add division.</p>`;
        });
    }
  });

//Delete product
document
  .getElementById("deleteDivisionForm")
  .addEventListener("submit", deleteDivision);

function deleteDivision(e) {
  e.preventDefault();

  const deleteDivisionid = document.getElementById("deleteDivisionid").value;

  fetch(`/api/companyDivisions/${deleteDivisionid}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p>Deleted Division ID: ${deleteDivisionid}</p>`;
        document.getElementById("deleteDivisionForm");
        getCompanyDivision();
      } else {
        document.getElementById("deleteDivisionForm").reset();
        document.getElementById(
          "deleteResult"
        ).innerHTML = `<p style="color:red;">Division ID: ${deleteDivisionid}, does not exist</p>`;
        document.getElementById("deleteDivisionForm");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById(
        "deleteResult"
      ).innerHTML = `<p style="color:red;">Failed to Delete division.</p>`;
    });
}

//PATCH update for specific fields
document.getElementById("patchBtn").addEventListener("click", function () {
  const divisionId = document.getElementById("divisionid").value;

  if (!divisionId) {
    document.getElementById("postResult").innerHTML =
      "<p style='color:red;'>Division ID is required for PATCH updates.</p>";
    return;
  }

  // Build PATCH payload only with fields that have a value
  const patchPayload = {};

  const fields = ["divisionname", "manager"];

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

  fetch(`/api/companyDivisions/${divisionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchPayload),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update division.");
      return res.json();
    })
    .then((data) => {
      document.getElementById(
        "postResult"
      ).innerHTML = `<p>Updated: ${data.divisionname} (ID: ${data.divisionid})</p>`;
      getCompanyDivision();
    })
    .catch((error) => {
      console.error("Update Error:", error);
      document.getElementById(
        "postResult"
      ).innerHTML = `<p style="color:red;">${error.message}</p>`;
    });
});
