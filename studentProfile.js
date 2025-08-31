function showSection(sectionId, btn) {
    document.querySelectorAll('.profile-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.querySelectorAll('.nav-buttons button').forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    btn.classList.add('active');
}

async function fetchResultsByEmail() {
    const email = document.getElementById('emailInput').value.trim();
    const errorMessageDiv = document.getElementById('errorMessage');
    const resultsTable = document.getElementById('dynamicResultsTable');
    const resultsBody = document.getElementById('resultsBody');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const profileInfoDiv = document.getElementById('studentProfileInfo');

    errorMessageDiv.textContent = '';
    resultsBody.innerHTML = '';
    resultsTable.style.display = 'none';
    noResultsMessage.style.display = 'none';

    if (!email) {
        errorMessageDiv.textContent = 'Please enter a valid email address.';
        return;
    }

    try {
        // Fetch results
        const resultsResponse = await fetch(`http://localhost:8080/api/results/by-email?email=${encodeURIComponent(email)}`);
        const profileResponse = await fetch(`http://localhost:8080/student/by-email?email=${encodeURIComponent(email)}`);

        // Results handling
        if (resultsResponse.ok) {
            const results = await resultsResponse.json();

            if (results.length === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                results.forEach(result => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${result.testType || 'N/A'}</td>
                        <td>${result.marks || 'N/A'}</td>
                        <td>${result.remarks || ''}</td>
                    `;
                    resultsBody.appendChild(row);
                });
                resultsTable.style.display = 'table';
            }
        } else {
            noResultsMessage.style.display = 'block';
        }

        // Profile handling
        if (profileResponse.ok) {
            const student = await profileResponse.json();
            profileInfoDiv.innerHTML = `
                <p><strong>Name:</strong> ${student.name || '-'}</p>
                <p><strong>Surname:</strong> ${student.surname || '-'}</p>
                <p><strong>Email:</strong> ${student.email || '-'}</p>
                <p><strong>Class:</strong> ${student.gradeApplying || '-'}</p>
                <p><strong>Age:</strong> ${student.age || '-'}</p>
            `;
        }

    } catch (error) {
        errorMessageDiv.textContent = 'Error fetching data. Please try again later.';
        console.error(error);
    }
}

// Load default section
window.onload = () => {
    showSection('results-section', document.getElementById('btnResults'));
};
