async function handleSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    // Clear previous error
    if (errorMessage) errorMessage.textContent = "";

    const loginData = {
        email: email,
        password: password
    };

    console.log("Login Data:", JSON.stringify(loginData));

    const baseUrl = "http://localhost:8084/loginAdmin";

    try {
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Invalid email or password.");
            } else {
                alert("Login failed. Please try again.");
            }
            return;
        }

        const result = await response.json();
        console.log("Login successful:", result);

        if (result) {
            alert("Login successful! Redirecting to admin page...");
            setTimeout(() => {
                window.location.href = "admin.html";
            }, 3000);
        } else {
            alert("Login failed! Please check your credentials.");
        }

    } catch (error) {
        console.error("Error occurred during login:", error);
        alert("Unable to connect to the server. Please try again later.");
        if (errorMessage) {
            errorMessage.textContent = "Server is unreachable. Please check your internet connection or try again later.";
        }
    }
}
