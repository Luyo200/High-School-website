document.getElementById("applicationFormElement").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.target;
  const successMessage = document.getElementById("successMessage");
  const errorMessage = document.getElementById("errorMessage");
  const submitButton = form.querySelector('button[type="submit"]');

  successMessage.textContent = "";
  errorMessage.textContent = "";

  try {
    // --- STEP 1: VALIDATIONS ---
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const idNumber = form.idNumber.value.trim();
    const idRegex = /^\d{13}$/;

    if (!idRegex.test(idNumber)) {
      errorMessage.textContent = "ID Number must be exactly 13 digits.";
      return;
    }

    const birthDatePart = idNumber.substring(0, 6);
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(birthDatePart.substring(0, 2), 10);
    const assumedYear = birthYear <= currentYear % 100 ? 2000 + birthYear : 1900 + birthYear;
    const birthMonth = parseInt(birthDatePart.substring(2, 4), 10);
    const birthDay = parseInt(birthDatePart.substring(4, 6), 10);
    const validDate = new Date(assumedYear, birthMonth - 1, birthDay);

    if (
      validDate.getFullYear() !== assumedYear ||
      validDate.getMonth() + 1 !== birthMonth ||
      validDate.getDate() !== birthDay
    ) {
      errorMessage.textContent = "Invalid South African ID number.";
      return;
    }

    const yearApplyingFor = parseInt(form.yearApplyingFor.value, 10);
    if (isNaN(yearApplyingFor) || yearApplyingFor < 2025 || yearApplyingFor > 2100) {
      errorMessage.textContent = "Please enter a valid year between 2025 and 2100.";
      return;
    }

    const studentIDFile = form.studentIDDoc.files[0];
    const guardianIDFile = form.guardianIDDoc.files[0];
    const reportFile = form.septemberReport.files[0];

    if (!studentIDFile || !guardianIDFile || !reportFile) {
      errorMessage.textContent = "Please upload all required documents.";
      return;
    }

    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (
      studentIDFile.size > maxSizeBytes ||
      guardianIDFile.size > maxSizeBytes ||
      reportFile.size > maxSizeBytes
    ) {
      errorMessage.textContent = `Each document must not exceed ${maxSizeMB}MB.`;
      return;
    }

    // --- STEP 2: All validations passed, now prepare data ---
    const student = {
      name: form.name.value.trim(),
      surname: form.surname.value.trim(),
      idNumber,
      email: form.email.value.trim(),
      phoneNumber: form.phoneNumber.value.trim(),
      currentGrade: form.currentGrade.value,
      gradeApplying: form.gradeApplying.value,
      stream: form.stream.value,
      yearApplyingFor,
      streetAddress: form.streetAddress.value.trim(),
      city: form.city.value.trim(),
      postalCode: form.postalCode.value.trim()
    };

    // --- Disable submit button to prevent multiple clicks ---
    if (submitButton) submitButton.disabled = true;

    // --- Clear all input fields immediately ---
    form.reset();
    form.studentIDDoc.value = "";
    form.guardianIDDoc.value = "";
    form.septemberReport.value = "";

    // --- STEP 3: Upload files ---
    const filesToUpload = [
      { file: studentIDFile, field: "studentIDDoc" },
      { file: guardianIDFile, field: "guardianIDDoc" },
      { file: reportFile, field: "septemberReport" }
    ];

    for (const fileObj of filesToUpload) {
      const formData = new FormData();
      formData.append("file", fileObj.file);

      const uploadResponse = await fetch("http://localhost:8084/upload", {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed for ${fileObj.field}`);
      }
    }

    // --- STEP 4: Submit student data ---
    const addResponse = await fetch("http://localhost:8084/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    });

    if (addResponse.status === 409) {
      const errorData = await addResponse.json();
      errorMessage.textContent =
        errorData.message || "Application with this email or ID already exists.";
      if (submitButton) submitButton.disabled = false;
      return;
    }

    if (!addResponse.ok) {
      throw new Error("Failed to submit application data.");
    }

    // --- STEP 5: Send confirmation email ---
    const emailResponse = await fetch("http://localhost:8084/notify-application-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: student.email })
    });

    if (!emailResponse.ok) {
      throw new Error("Failed to send confirmation email.");
    }

    // --- STEP 6: Final success ---
    successMessage.textContent =
      "Application and documents submitted successfully! Confirmation email sent. Redirecting in 5 seconds...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 5000);

  } catch (error) {
    errorMessage.textContent = "Submission failed: " + error.message;
    if (submitButton) submitButton.disabled = false; // Re-enable on failure
  }
});
