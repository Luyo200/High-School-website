window.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#applicationTable tbody");
  const storedApplications = JSON.parse(localStorage.getItem("applications")) || [];
  // Load applications from localStorage
  // === Backend needed ===
  // In production, you should fetch this data from a backend database (e.g., via fetch to an API endpoint).

  storedApplications.forEach(app => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${app.firstName}</td>
      <td>${app.surname}</td>
      <td>${app.email}</td>
      <td>${app.idNumber}</td>
      <td>${app.currentGrade}</td>
      <td>${app.gradeApplying}</td>
      <td>${app.stream}</td>
      <td>${app.age}</td>
      <td>${app.learnerNumber}</td>
      <td>${app.alternativeNumber}</td>
      <td>${app.homeNumber}</td>
      <td>${app.address}</td>
      <td>${app.submittedAt}</td>
    `;
    tableBody.appendChild(row);
  });
});
