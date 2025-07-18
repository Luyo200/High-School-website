const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const strengthText = document.getElementById("strength-text");
const errorMsg = document.getElementById("error-message");

// Password strength checker
passwordInput.addEventListener("input", () => {
  const strength = getPasswordStrength(passwordInput.value);
  strengthText.textContent = `Strength: ${strength.label}`;
  strengthText.style.color = strength.color;
  checkPasswordMatch();
});

// Password match checker
confirmPasswordInput.addEventListener("input", checkPasswordMatch);

function checkPasswordMatch() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (confirmPassword && password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match.";
    errorMsg.style.color = "red";
  } else if (confirmPassword && password === confirmPassword) {
    errorMsg.textContent = "Passwords match.";
    errorMsg.style.color = "green";
  } else {
    errorMsg.textContent = "";
  }
}

document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const surname = document.getElementById("surname").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  errorMsg.textContent = "";

  if (!name || !surname || !email || !phone || !password || !confirmPassword) {
    errorMsg.textContent = "All fields are required.";
    errorMsg.style.color = "red";
    return;
  }

  if (!validateEmail(email)) {
    errorMsg.textContent = "Please enter a valid email.";
    errorMsg.style.color = "red";
    return;
  }

  if (!/^\d{10,}$/.test(phone)) {
    errorMsg.textContent = "Phone number must contain at least 10 digits.";
    errorMsg.style.color = "red";
    return;
  }

  if (!validatePassword(password)) {
    errorMsg.textContent =
      "Password must be 8–16 characters long, include at least 1 uppercase letter, and at least 3 lowercase letters.";
    errorMsg.style.color = "red";
    return;
  }

  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match.";
    errorMsg.style.color = "red";
    return;
  }

  // Success
  alert("Account created successfully!");
  errorMsg.textContent = "Redirecting to login...";
  errorMsg.style.color = "green";

  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
});

// Helper functions

function validateEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function validatePassword(password) {
  if (password.length < 8 || password.length > 16) return false;
  const upper = /[A-Z]/.test(password);
  const lower = (password.match(/[a-z]/g) || []).length >= 3;
  return upper && lower;
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if ((password.match(/[a-z]/g) || []).length >= 3) score++;
  if (/\d/.test(password)) score++;
  if (/[\W_]/.test(password)) score++;

  if (score <= 2) {
    return { label: "Weak", color: "red" };
  } else if (score === 3 || score === 4) {
    return { label: "Moderate", color: "orange" };
  } else {
    return { label: "Strong", color: "green" };
  }
}
