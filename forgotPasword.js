document.getElementById("forgotForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message");

  // Hide message initially
  message.style.display = "none";
  message.textContent = "";

  if (!email) {
    message.textContent = "Please enter your email.";
    message.style.color = "red";
    message.style.display = "block";
    return;
  }

  if (!validateEmail(email)) {
    message.textContent = "Invalid email format.";
    message.style.color = "red";
    message.style.display = "block";
    return;
  }

  // Simulate success
  message.textContent = "A reset link has been sent to your email.";
  message.style.color = "green";
  message.style.display = "block";

  // Optional: Clear email field
  document.getElementById("email").value = "";
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
