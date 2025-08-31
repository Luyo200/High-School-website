const baseUrl = "http://localhost:8080";
const studentsTbody = document.querySelector("#studentsTable tbody");
const attachmentsTbody = document.querySelector("#attachmentsTable tbody");
const statusDiv = document.getElementById("status");

const statuses = ["Pending", "Accepted", "Rejected", "Waitlisted"];

async function loadData() {
  statusDiv.textContent = "Loading data...";
  console.log("Fetching student and document data...");

  try {
    const [studentsResponse, documentsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/student/all`, { method: "GET", headers: { Accept: "application/json" } }),
      fetch(`${baseUrl}/documents`, { method: "GET", headers: { Accept: "application/json" } }),
    ]);

    if (!studentsResponse.ok) {
      throw new Error(`Students fetch failed with status ${studentsResponse.status}`);
    }
    if (!documentsResponse.ok) {
      throw new Error(`Documents fetch failed with status ${documentsResponse.status}`);
    }

    const students = await studentsResponse.json();
    const documents = await documentsResponse.json();

    console.log("Students data:", students);
    console.log("Documents data:", documents);

    renderStudents(students);
    renderDocuments(documents);

    statusDiv.textContent = "";
  } catch (err) {
    console.error("Error loading data:", err);
    statusDiv.textContent = "Failed to load data. Check browser console for details.";
    studentsTbody.innerHTML = `<tr><td colspan="12" style="color:red; text-align:center;">Failed to load students.</td></tr>`;
    attachmentsTbody.innerHTML = `<tr><td colspan="2" style="color:red; text-align:center;">Failed to load attachments.</td></tr>`;
  }
}

function renderStudents(students) {
  studentsTbody.innerHTML = "";
  if (!Array.isArray(students) || students.length === 0) {
    studentsTbody.innerHTML = `<tr><td colspan="12" style="text-align:center;">No applications found.</td></tr>`;
    return;
  }

  students.forEach(student => {
    const address = [student.streetAddress, student.city, student.postalCode]
      .filter(Boolean)
      .join(", ");

    const appliedOn = student.applicationDateTime
      ? new Date(student.applicationDateTime).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

    const currentStatus = statuses.includes(student.status) ? student.status : student.status || "Pending";
    const statusOptions = statuses.map(s => `<option value="${s}"${s === currentStatus ? " selected" : ""}>${s}</option>`).join("");

    // If gradeApplying is 8 or 9, stream column is empty
    let streamContent = "";
    if (student.gradeApplying && ![8, 9].includes(Number(student.gradeApplying))) {
      streamContent = student.stream || "";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name || ""}</td>
      <td>${student.surname || ""}</td>
      <td>${student.email || ""}</td>
      <td>${student.idNumber || ""}</td>
      <td>${student.phoneNumber || ""}</td>
      <td>${student.currentGrade || ""}</td>
      <td>${student.gradeApplying || ""}</td>
      <td>${streamContent}</td>
      <td>${student.yearApplyingFor || ""}</td>
      <td>${appliedOn}</td>
      <td>${address}</td>
      <td>
        <select class="statusSelect">${statusOptions}</select>
        <button class="saveStatusBtn">Save</button>
      </td>
    `;
    row.dataset.idNumber = student.idNumber || "";
    row.dataset.email = student.email || "";
    studentsTbody.appendChild(row);
  });
}

function renderDocuments(documents) {
  attachmentsTbody.innerHTML = "";
  if (!Array.isArray(documents) || documents.length === 0) {
    attachmentsTbody.innerHTML = `<tr><td colspan="2" style="text-align:center;">No attachments found.</td></tr>`;
    return;
  }

  documents.forEach(doc => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${doc.fileName || ""}</td>
      <td><a href="${doc.downloadURL}" target="_blank" download="${doc.fileName}">Download</a></td>
    `;
    attachmentsTbody.appendChild(row);
  });
}

// === Handle Status Save ===
studentsTbody.addEventListener("click", async event => {
  if (!event.target.classList.contains("saveStatusBtn")) return;

  const row = event.target.closest("tr");
  const select = row.querySelector(".statusSelect");
  const newStatus = select.value;
  const { idNumber, email } = row.dataset;

  // Validate before submitting: ensure required data is present
  if (!idNumber || !email || !newStatus) {
    alert("Missing required data. Cannot save status.");
    return; // Do not submit if validation fails
  }

  event.target.disabled = true;
  event.target.textContent = "Saving...";

  try {
    const response = await fetch(`${baseUrl}/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idNumber, status: newStatus, email }),
    });

    if (!response.ok) throw new Error(`Status update failed: ${response.status}`);

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
});

document.addEventListener("DOMContentLoaded", loadData);
