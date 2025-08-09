const forgotForm = document.getElementById("forgotForm");
const codeForm = document.getElementById("codeForm");
const passwordForm = document.getElementById("passwordForm");

const emailInput = document.getElementById("email");
const codeInput = document.getElementById("code");
const newPasswordInput = document.getElementById("newPassword");

const message = document.getElementById("message");

// Store the verified code after step 2
let verifiedCode = "";

// Validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Step 1: Email submission — send reset code request to backend
forgotForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  message.style.display = "none";

  if (!validateEmail(email)) {
    showMessage("Invalid email format.", "red");
    return;
  }

  try {
    const response = await fetch("http://localhost:8084/send-retrieve-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      showMessage(`Error: ${errorText}`, "red");
      return;
    }

    showMessage("A reset code has been sent to your email.", "green");
    forgotForm.style.display = "none";
    codeForm.style.display = "block";
  } catch (error) {
    showMessage("Failed to send reset code. Try again later.", "red");
  }
});

// Step 2: Code verification — verify code with backend
codeForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const userCode = codeInput.value.trim();

  try {
    const response = await fetch("http://localhost:8084/verify-reset-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: userCode }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      showMessage(`Error: ${errorText}`, "red");
      return;
    }

    verifiedCode = userCode; // Save the verified code

    showMessage("Code verified. Please enter your new password.", "green");
    codeForm.style.display = "none";
    passwordForm.style.display = "block";
  } catch (error) {
    showMessage("Failed to verify code. Try again later.", "red");
  }
});

// Step 3: Set new password — send new password and verified code to backend
passwordForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const newPassword = newPasswordInput.value.trim();

  if (newPassword.length < 6) {
    showMessage("Password must be at least 6 characters.", "red");
    return;
  }

  try {
    const response = await fetch("http://localhost:8084/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, code: verifiedCode }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      showMessage(`Error: ${errorText}`, "red");
      return;
    }

    showMessage("Your password has been reset successfully!", "green");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);
  } catch (error) {
    showMessage("Failed to reset password. Try again later.", "red");
  }
});

function showMessage(text, color) {
  message.textContent = text;
  message.style.color = color;
  message.style.display = "block";
}
