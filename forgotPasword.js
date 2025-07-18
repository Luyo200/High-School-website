document.getElementById("forgotForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message");

  if (!email) {
    message.textContent = "Please enter your email.";
    message.style.color = "red";
    return;
  }

  if (!validateEmail(email)) {
    message.textContent = "Invalid email format.";
    message.style.color = "red";
    return;
  }
  // TODO: Backend integration needed here
  // Example:
  // 1. Send a request to your server API endpoint to initiate password reset email.
  // 2. Handle server response (success or failure).
  // 3. Display corresponding message to user based on response.

  // For now, simulating success:

  message.textContent = "A reset link has been sent to your email.";
  message.style.color = "green";
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
