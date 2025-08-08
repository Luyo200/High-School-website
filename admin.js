const baseUrl = "http://localhost:8084";
const studentsTbody = document.querySelector("#studentsTable tbody");
const attachmentsTbody = document.querySelector("#attachmentsTable tbody");
const statusDiv = document.getElementById("status");

const statuses = ["Pending", "Accepted", "Rejected", "Waitlisted"];

async function loadData() {
  try {
    statusDiv.textContent = "Loading data...";

    const [studentsResponse, documentsResponse] = await Promise.all([
      fetch(`${baseUrl}/all`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      }),
      fetch(`${baseUrl}/documents`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      })
    ]);

    if (!studentsResponse.ok || !documentsResponse.ok) {
      throw new Error("Failed to fetch data from server");
    }

    const students = await studentsResponse.json();
    const documents = await documentsResponse.json();

    // === Students Table ===
    studentsTbody.innerHTML = "";
    if (!students.length) {
      studentsTbody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No applications found.</td></tr>`;
    } else {
      students.forEach(student => {
        const address = [student.streetAddress, student.city, student.postalCode]
          .filter(Boolean)
          .join(", ");

        const submittedAt = student.submittedAt
          ? new Date(student.submittedAt).toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : "";

        let currentStatus = "Pending";
        if (student.status) {
          const normalized = student.status.toLowerCase();
          if (statuses.map(st => st.toLowerCase()).includes(normalized)) {
            currentStatus = statuses.find(st => st.toLowerCase() === normalized);
          } else {
            currentStatus = student.status;
          }
        }

        const statusOptions = statuses.map(s => {
          const selected = s === currentStatus ? "selected" : "";
          return `<option value="${s}" ${selected}>${s}</option>`;
        }).join("");

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${student.name || ""}</td>
          <td>${student.surname || ""}</td>
          <td>${student.email || ""}</td>
          <td>${student.idNumber || ""}</td>
          <td>${student.phoneNumber || ""}</td>
          <td>${student.currentGrade || ""}</td>
          <td>${student.gradeApplying || ""}</td>
          <td>${student.stream || ""}</td>
          <td>${address}</td>
          <td>
            <span>${submittedAt}</span><br/>
            <select class="statusSelect">${statusOptions}</select>
            <button class="saveStatusBtn">Save</button>
          </td>
        `;
        row.dataset.idNumber = student.idNumber || "";
        row.dataset.email = student.email || "";
        studentsTbody.appendChild(row);
      });
    }

    // === Attachments Table ===
    attachmentsTbody.innerHTML = "";
    if (!documents.length) {
      attachmentsTbody.innerHTML = `<tr><td colspan="2" style="text-align:center;">No attachments found.</td></tr>`;
    } else {
      documents.forEach(doc => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${doc.fileName || ""}</td>
          <td><a href="${doc.downloadURL}" target="_blank" rel="noopener noreferrer" download="${doc.fileName}">Download</a></td>
        `;
        attachmentsTbody.appendChild(row);
      });
    }

    statusDiv.textContent = "";
  } catch (err) {
    console.error("Error loading data:", err);
    statusDiv.textContent = "Failed to load data. Check console for details.";
    studentsTbody.innerHTML = `<tr><td colspan="10" style="color:red; text-align:center;">Failed to load students.</td></tr>`;
    attachmentsTbody.innerHTML = `<tr><td colspan="2" style="color:red; text-align:center;">Failed to load attachments.</td></tr>`;
  }
}

// === Handle Status Save ===
studentsTbody.addEventListener("click", async (event) => {
  if (event.target.classList.contains("saveStatusBtn")) {
    const row = event.target.closest("tr");
    const select = row.querySelector(".statusSelect");
    const newStatus = select.value;
    const idNumber = row.dataset.idNumber;
    const email = row.dataset.email;

    event.target.disabled = true;
    event.target.textContent = "Saving...";

    try {
      const response = await fetch(`${baseUrl}/update-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ idNumber, status: newStatus, email })
      });

      if (!response.ok) {
        throw new Error("Status update failed.");
      }

      alert("Status updated and confirmation email has been sent.");

      event.target.textContent = "Saved";
      setTimeout(() => {
        event.target.disabled = false;
        event.target.textContent = "Save";
      }, 1500);
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status.");
      event.target.disabled = false;
      event.target.textContent = "Save";
    }
  }
});

document.addEventListener("DOMContentLoaded", loadData);
