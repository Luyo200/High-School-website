document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMessage = document.getElementById('error-message');

  if (!email || !password) {
    errorMessage.textContent = 'Please fill in all fields.';
    return;
  }

  if (!validateEmail(email)) {
    errorMessage.textContent = 'Please enter a valid email address.';
    return;
  }

  // Dummy authentication (you can integrate with a backend later)
  if (email === "test@example.com" && password === "password123") {
    alert("Login successful!");
    errorMessage.textContent = "";
    // Redirect or perform actions here
  } else {
    errorMessage.textContent = "Invalid email or password.";
  }
});

function validateEmail(email) {
  // Basic email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
