document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMessage = document.getElementById('error-message');

  if (!email || !password) {
    errorMessage.textContent = 'Please fill in all fields.';
    errorMessage.style.color = 'red';
    return;
  }

  if (!validateEmail(email)) {
    errorMessage.textContent = 'Please enter a valid email address.';
    errorMessage.style.color = 'red';
    return;
  }
    // TODO: Backend integration needed here
  // Example:
  // 1. Send login request to your backend API with email and password.
  // 2. Wait for response (success or failure).
  // 3. On success: redirect user to application page.
  // 4. On failure: show error message from server.
  // For now, simulating a successful login:S
  // Dummy authentication (replace with backend logic)
  if (email === "test@example.com" && password === "password123") {
    errorMessage.textContent = "Login successful! Redirecting...";
    errorMessage.style.color = 'green';

    setTimeout(() => {
      window.location.href = "application.html";
    }, 1000); // 1 second delay
  } else {
    errorMessage.textContent = "Invalid email or password.";
    errorMessage.style.color = 'red';
  }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
