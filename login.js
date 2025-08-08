async function handleSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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
            throw new Error("Login failed");
        }

        const result = await response.json();
        console.log("Login successful:", result);

        if(result){
            alert("Login successful! Redirecting to admin page...");
            setTimeout(() => {
                window.location.href = "admin.html";
            }, 3000); // 3 seconds delay
        }
        else{
            alert("Login failed! Please check your credentials.");
        }
    } catch (error) {
        console.error("Error occurred during login:", error);
    }
}
