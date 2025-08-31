// Element references
const userTypeSelect = document.getElementById('userType');
const nameGroup = document.getElementById('nameGroup');
const surnameGroup = document.getElementById('surnameGroup');
const idNumberGroup = document.getElementById('idNumberGroup');
const phoneGroup = document.getElementById('phoneGroup');
const ageGroup = document.getElementById('ageGroup');
const passwordGroup = document.getElementById('passwordGroup');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const subjectGroup = document.getElementById('subjectGroup');
const altSubjectGroup = document.getElementById('altSubjectGroup');
const emailVerificationGroup = document.getElementById('emailVerificationGroup');

const sendCodeBtn = document.getElementById('sendCodeBtn');
const verifyCodeBtn = document.getElementById('verifyCodeBtn');
const verificationCodeInput = document.getElementById('verificationCode');
const verificationMessage = document.getElementById('verificationMessage');

const errorMessage = document.getElementById('error-message');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

let verificationCodeSent = false;
let isEmailVerified = false;
let verifiedCode = "";

// Toggle visibility based on user type
userTypeSelect.addEventListener('change', function () {
    const userType = this.value;

    // Hide all groups
    [nameGroup, surnameGroup, idNumberGroup, phoneGroup, ageGroup, passwordGroup, confirmPasswordGroup,
        subjectGroup, altSubjectGroup, emailVerificationGroup].forEach(el => el.classList.add('hidden'));

    // Reset states
    verificationCodeSent = false;
    isEmailVerified = false;
    verifiedCode = "";
    verificationMessage.style.display = 'none';
    verificationCodeInput.value = '';
    sendCodeBtn.disabled = false;
    verifyCodeBtn.disabled = false;

    // Disable password fields
    passwordInput.disabled = true;
    confirmPasswordInput.disabled = true;

    if (userType === 'teacher') {
        [nameGroup, surnameGroup, idNumberGroup, phoneGroup, ageGroup,
            passwordGroup, confirmPasswordGroup, subjectGroup, altSubjectGroup].forEach(el => el.classList.remove('hidden'));
        passwordInput.disabled = false;
        confirmPasswordInput.disabled = false;
    } else if (userType === 'admin') {
        [nameGroup, surnameGroup, idNumberGroup, phoneGroup, ageGroup,
            passwordGroup, confirmPasswordGroup].forEach(el => el.classList.remove('hidden'));
        passwordInput.disabled = false;
        confirmPasswordInput.disabled = false;
    } else if (userType === 'student') {
        emailVerificationGroup.classList.remove('hidden');
    }
});

// Validation helpers
function isValidSAID(id) {
    return /^\d{13}$/.test(id) && parseInt(id.substr(2, 2)) <= 12 && parseInt(id.substr(4, 2)) <= 31;
}

function isValidPassword(pwd) {
    return pwd.length >= 8 && pwd.length <= 16 && /[A-Z]/.test(pwd) &&
        ((pwd.match(/[a-z]/g) || []).length >= 3);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Backend API calls
async function sendVerificationCode(email) {
    try {
        const res = await fetch('http://localhost:8080/api/student/send-retrieve-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!res.ok) throw new Error(await res.text());
        return { success: true, message: "Verification code sent!" };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

async function verifyCode(email, code) {
    try {
        const res = await fetch('http://localhost:8080/api/student/verify-reset-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        if (!res.ok) throw new Error(await res.text());
        return { success: true, message: "Code verified successfully!" };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

// Event: Send code
sendCodeBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    if (!email || !isValidEmail(email)) {
        errorMessage.textContent = "Enter a valid email.";
        errorMessage.style.display = 'block';
        return;
    }

    sendCodeBtn.disabled = true;
    verificationMessage.textContent = "Sending...";
    verificationMessage.style.display = 'block';

    const result = await sendVerificationCode(email);
    if (result.success) {
        verificationCodeSent = true;
        verificationMessage.textContent = result.message;
        verificationMessage.style.color = 'green';
    } else {
        sendCodeBtn.disabled = false;
        verificationMessage.textContent = result.message;
        verificationMessage.style.color = 'red';
    }
});

// Event: Verify code
verifyCodeBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const code = verificationCodeInput.value.trim();

    if (!verificationCodeSent) {
        verificationMessage.textContent = "Send the verification code first.";
        verificationMessage.style.color = 'red';
        return;
    }

    if (!code) {
        verificationMessage.textContent = "Enter the verification code.";
        verificationMessage.style.color = 'red';
        return;
    }

    verifyCodeBtn.disabled = true;
    verificationMessage.textContent = "Verifying...";
    verificationMessage.style.display = 'block';

    const result = await verifyCode(email, code);
    if (result.success) {
        isEmailVerified = true;
        verifiedCode = code;
        alert("Code verified! You may now reset your password.");

        emailVerificationGroup.classList.add('hidden');
        passwordGroup.classList.remove('hidden');
        confirmPasswordGroup.classList.remove('hidden');
        passwordInput.disabled = false;
        confirmPasswordInput.disabled = false;

        verificationMessage.style.display = 'none';
    } else {
        verificationMessage.textContent = result.message;
        verificationMessage.style.color = 'red';
        verifyCodeBtn.disabled = false;
    }
});

// ... your existing code above remains unchanged ...

// Form submission handler
async function handleSubmit(event) {
    event.preventDefault();
    errorMessage.style.display = 'none';
    const userType = userTypeSelect.value;
    const email = document.getElementById("email").value.trim();
    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const idNumber = document.getElementById("idNumber").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const age = document.getElementById("age").value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const subject = document.getElementById("subject").value.trim();
    const altSubject = document.getElementById("altSubject").value.trim();

    if (!userType) {
        errorMessage.textContent = "Please select a user type.";
        errorMessage.style.display = 'block';
        return;
    }

    if (userType === "student") {
        if (!verificationCodeSent || !isEmailVerified || !verifiedCode) {
            errorMessage.textContent = "Email verification required.";
            errorMessage.style.display = 'block';
            return;
        }

        if (!password || !confirmPassword || password !== confirmPassword || !isValidPassword(password)) {
            errorMessage.textContent = "Passwords do not match or are invalid.";
            errorMessage.style.display = 'block';
            return;
        }

        const resetPayload = {
            email,
            code: verifiedCode,
            newPassword: password   // <-- FIX: Must be 'newPassword' to match backend!
        };

        try {
            const response = await fetch("http://localhost:8080/api/student/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resetPayload),
            });

            if (response.ok) {
                alert("Password reset successful! Redirecting to login...");
                setTimeout(() => window.location.href = "login.html", 2000);
            } else {
                const err = await response.text();
                errorMessage.textContent = "Reset failed: " + err;
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            errorMessage.textContent = "Server error.";
            errorMessage.style.display = 'block';
        }

    } else if (userType === "teacher" || userType === "admin") {
        if (!email || !name || !surname || !idNumber || !phone || !age || !password || !confirmPassword) {
            errorMessage.textContent = "Please fill in all required fields.";
            errorMessage.style.display = 'block';
            return;
        }

        if (!isValidSAID(idNumber)) {
            errorMessage.textContent = "Invalid South African ID.";
            errorMessage.style.display = 'block';
            return;
        }

        if (password !== confirmPassword || !isValidPassword(password)) {
            errorMessage.textContent = "Passwords do not match or are invalid.";
            errorMessage.style.display = 'block';
            return;
        }

        let apiUrl = "", registerData = {
            email, userType, name, surname, idNumber, phone, age, password
        };

        if (userType === "teacher") {
            apiUrl = "http://localhost:8080/api/teacher/register";
            registerData.subject = subject;
            registerData.altSubject = altSubject || null;
        } else {
            apiUrl = "http://localhost:8080/api/admin/addAdmin";
        }

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData),
            });

            if (res.ok) {
                alert("Registration successful!");
                setTimeout(() => window.location.href = "login.html", 2000);
            } else {
                const err = await res.text();
                errorMessage.textContent = "Registration failed: " + err;
                errorMessage.style.display = 'block';
            }
        } catch (e) {
            errorMessage.textContent = "Server error.";
            errorMessage.style.display = 'block';
        }
    }
}

// Attach submit handler
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registerForm').addEventListener('submit', handleSubmit);
});
