async function handleSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const userType = document.getElementById("userType").value;
    const errorMessage = document.getElementById("error-message");

    if (errorMessage) errorMessage.textContent = "";

    if (!email || !password || !userType) {
        if (errorMessage) errorMessage.textContent = "Please fill in all fields and select a user type.";
        return;
    }

    const loginData = { email, password, userType };

    console.log("Attempting login with data:", loginData);

    const baseUrl = "http://localhost:8080/api/auth/login";

    try {
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Login failed with status ${response.status}:`, errorText);

            if (response.status === 401) {
                alert("Invalid email or password.");
            } else if (response.status === 404) {
                alert("Login endpoint not found (404). Please check the URL.");
            } else {
                alert(`Login failed (${response.status}): ${errorText || "Please try again."}`);
            }

            if (errorMessage) {
                errorMessage.textContent = `Login error: ${errorText || "Unknown error"}`;
            }
            return;
        }

        const result = await response.json();
        console.log("Login response JSON:", result);

        if (result && result.success === true) {
            alert("Login successful! Redirecting...");
            setTimeout(() => {
                switch (userType.toLowerCase()) {
                    case "student":
                        window.location.href = "StudentProfile.html";
                        break;
                    case "teacher":
                        window.location.href = "TeacherProfile.html";
                        break;
                    case "admin":
                        window.location.href = "admin.html";
                        break;
                    default:
                        window.location.href = "index.html";
                        break;
                }
            }, 2000);
        } else {
            alert("Login failed! Please check your credentials.");
            if (errorMessage) {
                errorMessage.textContent = "Invalid email, password, or user type.";
            }
        }
    } catch (error) {
        console.error("Error occurred during login:", error);
        alert("Unable to connect to the server. Please try again later.");
        if (errorMessage) {
            errorMessage.textContent = "Server is unreachable. Please check your internet connection or try again later.";
        }
    }
}
