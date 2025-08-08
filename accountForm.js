document.getElementById("registerForm").addEventListener("submit", handleSubmit);
document.getElementById("password").addEventListener("input", updatePasswordStrength);

async function handleSubmit(event) {
    event.preventDefault();

    // Collect form data
    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorMessage = document.getElementById("error-message");

    // Clear previous error
    errorMessage.textContent = "";

    // Validate password match
    if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match.";
        return;
    }

    const registerData = { email, name, surname, password };

    console.log("Register Data:", JSON.stringify(registerData));

    const baseUrl = "http://localhost:8084/addAdmin";

    try {
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(registerData),
        });

        if (response.ok) {
            alert("Registration successful! Redirecting to login...");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000); // Redirect after 2 seconds
        }else if (response.status === 409) {
            const text = await response.text();
            if (text.includes(email)) {
                errorMessage.textContent = "An account with this email/password already exists.";
            } else if (text.includes(password)) {
                errorMessage.textContent = "An account with this email/password already exists..";
            } else {
                errorMessage.textContent = "An account with this email/password already exists.";
            }
        } else {
            errorMessage.textContent = "Registration failed. Please try again.";
        }
    } catch (error) {
        console.error("Error occurred during registration:", error);
        errorMessage.textContent = "An account with this email/password already exists";
    }
}

function updatePasswordStrength() {
    const password = document.getElementById("password").value;
    const strengthText = document.getElementById("strength-text");

    const strength = getPasswordStrength(password);
    strengthText.textContent = strength.label;
    strengthText.style.color = strength.color;
}

function getPasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if ((password.match(/[a-z]/g) || []).length >= 3) score++;
    if (/\d/.test(password)) score++;
    if (/[\W_]/.test(password)) score++; // special characters

    if (score <= 2) {
        return { label: "Weak", color: "red" };
    } else if (score === 3 || score === 4) {
        return { label: "Medium", color: "orange" };
    } else {
        return { label: "Strong", color: "green" };
    }
}
