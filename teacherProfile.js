let currentTeacher = null;

// Load profile by email (prompt user to enter email)
async function loadTeacherProfileByEmail(email) {
  try {
    const response = await fetch(`http://localhost:8080/api/teacher/by-email?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      if (response.status === 404) {
        alert('Teacher not found with this email.');
        return;
      }
      throw new Error('Failed to load teacher profile.');
    }

    currentTeacher = await response.json();

    // Fill the profile card with teacher data
    document.getElementById("teacherId").innerText = currentTeacher.id || '';
    document.getElementById("teacherNameFull").innerText = `${currentTeacher.name || ''} ${currentTeacher.surname || ''}`;
    document.getElementById("teacherIdNumber").innerText = currentTeacher.idNumber || '';
    document.getElementById("teacherEmail").innerText = currentTeacher.email || '';
    document.getElementById("teacherPhoneNumber").innerText = currentTeacher.phoneNumber || '';
    document.getElementById("teacherAge").innerText = currentTeacher.age || '';
    document.getElementById("teacherSubject").innerText = currentTeacher.subject || '';
    document.getElementById("teacherAltSubject").innerText = currentTeacher.alternativeSubject || '';

  } catch (error) {
    console.error('Error loading teacher profile:', error);
    alert('Failed to load your profile. Please check your network or try again.');
  }
}

// Show the selected section and hide others
function showSection(sectionId) {
  document.querySelectorAll('section').forEach(section => {
    section.classList.remove('active');
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

// Add new row for capturing student result
function addRow() {
  const tbody = document.getElementById("resultsTable").getElementsByTagName("tbody")[0];
  const newRow = tbody.insertRow();

  const placeholders = [
    "Enter Name",
    "Enter Surname",
    "Enter Email",
    "Enter Test Type",
    "Enter Marks",
    "Enter Remarks"
  ];

  for (let i = 0; i < placeholders.length; i++) {
    const cell = newRow.insertCell();
    const input = document.createElement("input");
    input.type = i === 2 ? "email" : i === 4 ? "number" : "text";
    input.placeholder = placeholders[i];
    cell.appendChild(input);
  }

  const actionCell = newRow.insertCell();
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-btn";
  deleteBtn.onclick = () => deleteRow(deleteBtn);
  actionCell.appendChild(deleteBtn);
}

// Delete a row
function deleteRow(button) {
  const row = button.closest("tr");
  if (row) {
    row.remove();
  }
}

// Save student results
async function saveResults() {
  const rows = document.querySelectorAll('#resultsTable tbody tr');
  const allResults = [];

  if (!currentTeacher || !currentTeacher.email) {
    alert("Your teacher profile is not loaded. Please go to the profile tab and load your profile first.");
    return;
  }

  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    const result = {
      teacherEmail: currentTeacher.email,
      name: inputs[0].value.trim(),
      surname: inputs[1].value.trim(),
      email: inputs[2].value.trim(),
      testType: inputs[3].value.trim(),
      marks: parseInt(inputs[4].value.trim(), 10),
      remarks: inputs[5].value.trim(),
    };

    if (
      !result.name ||
      !result.surname ||
      !result.email ||
      !result.testType ||
      isNaN(result.marks)
    ) {
      alert("Please fill all required fields in each row before saving.");
      return;
    }

    allResults.push(result);
  }

  try {
    for (const result of allResults) {
      const response = await fetch('http://localhost:8080/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save result: ${errorText}`);
      }

      const data = await response.json();
      console.log('Saved:', data);
    }
    alert("Results submitted successfully!");

    // Reload results after saving
    await loadResultsByTeacherEmail(currentTeacher.email);

  } catch (error) {
    console.error("Error saving results:", error);
    alert("Error submitting results. Check console for details.");
  }
}

// Load all student results by teacher's email and display under Student Management section
async function loadResultsByTeacherEmail(email) {
  try {
    const response = await fetch(`http://localhost:8080/api/results/by-teacher-email?email=${encodeURIComponent(email)}`);
    if (response.status === 204) { // no content
      alert("No results found for your email.");
      removeExistingResultsTable();
      return;
    }
    if (!response.ok) {
      throw new Error('Failed to load results.');
    }

    const results = await response.json();
    displayResultsTable(results);
  } catch (error) {
    console.error("Error loading results:", error);
    alert("Failed to load results. Check console for details.");
  }
}

// Display results table inside Student Management section below the form
function displayResultsTable(results) {
  removeExistingResultsTable();

  const container = document.createElement('div');
  container.id = "resultsDisplayContainer";
  container.style.marginTop = '30px';

  const title = document.createElement('h3');
  title.innerText = 'All Student Results Submitted by You';
  container.appendChild(title);

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  ['Name', 'Surname', 'Email', 'Test Type', 'Marks', 'Remarks'].forEach(text => {
    const th = document.createElement('th');
    th.innerText = text;
    th.style.border = '1px solid #ddd';
    th.style.padding = '8px';
    th.style.backgroundColor = '#4CAF50';
    th.style.color = 'white';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  results.forEach(res => {
    const row = document.createElement('tr');
    [res.name, res.surname, res.email, res.testType, res.marks, res.remarks].forEach(val => {
      const td = document.createElement('td');
      td.innerText = val ?? '';
      td.style.border = '1px solid #ddd';
      td.style.padding = '8px';
      td.style.textAlign = 'center';
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);

  // Append inside Student Management section below existing content
  const studentMgmtSection = document.getElementById('studentManagementSection');
  studentMgmtSection.appendChild(container);
}

// Remove previously displayed results table (if any)
function removeExistingResultsTable() {
  const existing = document.getElementById("resultsDisplayContainer");
  if (existing) {
    existing.remove();
  }
}

// === Button Event Listeners ===
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("btnProfile").addEventListener("click", () => {
    showSection("profileSection");

    // Prompt teacher to enter their email when profile tab is opened
    const email = prompt("Please enter your email to load your profile:");
    if (email) {
      loadTeacherProfileByEmail(email.trim());
    }
  });

  document.getElementById("btnNotifications").addEventListener("click", () => {
    showSection("notificationsSection");
  });

  document.getElementById("btnStudentManagement").addEventListener("click", () => {
    showSection("studentManagementSection");

    // Load results immediately when switching to student management if teacher email is known
    if (currentTeacher && currentTeacher.email) {
      loadResultsByTeacherEmail(currentTeacher.email);
    }
  });
});
