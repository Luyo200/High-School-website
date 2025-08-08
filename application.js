document.getElementById("applicationFormElement").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.target;
  const successMessage = document.getElementById("successMessage");
  const errorMessage = document.getElementById("errorMessage");
  successMessage.textContent = "";
  errorMessage.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Validate ID Number
  const idNumber = form.idNumber.value.trim();
  const idRegex = /^\d{13}$/;

  if (!idRegex.test(idNumber)) {
    errorMessage.textContent = "ID Number must be exactly 13 digits.";
    return;
  }

  // Validate if South African ID (basic check: YYMMDDxxxxxx8)
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

  // Check file sizes
  const studentIDFile = form.studentIDDoc.files[0];
  const guardianIDFile = form.guardianIDDoc.files[0];
  const reportFile = form.septemberReport.files[0];

  if (!studentIDFile || !guardianIDFile || !reportFile) {
    errorMessage.textContent = "Please upload all required documents.";
    return;
  }

  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (studentIDFile.size > maxSizeBytes || guardianIDFile.size > maxSizeBytes || reportFile.size > maxSizeBytes) {
    errorMessage.textContent = `Each document must not exceed ${maxSizeMB}MB.`;
    return;
  }

  // Prepare student data JSON object
  const student = {
    name: form.name.value.trim(),
    surname: form.surname.value.trim(),
    idNumber,
    email: form.email.value.trim(),
    phoneNumber: form.phoneNumber.value.trim(),
    currentGrade: form.currentGrade.value,
    gradeApplying: form.gradeApplying.value,
    stream: form.stream.value,
    streetAddress: form.streetAddress.value.trim(),
    city: form.city.value.trim(),
    postalCode: form.postalCode.value.trim()
  };

  try {
    // 1. Submit student data JSON to /add
    const addResponse = await fetch("http://localhost:8084/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    });

    if (addResponse.status === 409) {
      const errorData = await addResponse.json();
      errorMessage.textContent =
        errorData.message || "Application with this email or ID already exists.";
      return;
    }

    if (!addResponse.ok) throw new Error("Failed to submit application data.");

    const addedStudent = await addResponse.json();

    // 2. Upload files
    const filesToUpload = [
      { file: studentIDFile, field: "studentIDDoc" },
      { file: guardianIDFile, field: "guardianIDDoc" },
      { file: reportFile, field: "septemberReport" }
    ];

    for (const fileObj of filesToUpload) {
      const formData = new FormData();
      formData.append("file", fileObj.file);
      // Optionally: formData.append("studentId", addedStudent.id);

      const uploadResponse = await fetch("http://localhost:8084/upload", {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed for ${fileObj.field}`);
      }
    }

    successMessage.textContent =
      "Application and documents submitted successfully! Redirecting in 5 seconds...";
    form.reset();

    setTimeout(() => {
      window.location.href = "index.html";
    }, 5000);

  } catch (error) {
    errorMessage.textContent = "Submission failed: " + error.message;
  }
});
