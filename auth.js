// Authentication Logic

document.addEventListener("DOMContentLoaded", function() {
    const currentUser = localStorage.getItem("currentUser");
    const currentPage = window.location.pathname.split("/").pop() || "login.html";

    if (currentUser && ["login.html","signup.html","forgot-password.html"].includes(currentPage)) {
        if (currentPage !== "forgot-password.html") window.location.href = "index.html";
    }

    if (!currentUser && currentPage === "index.html") {
        window.location.href = "login.html";
    }

    initializeAuthForms();
});

function initializeAuthForms() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const forgotForm = document.getElementById("forgotForm");

    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignup);
        const passwordInput = document.getElementById("signupPassword");
        if (passwordInput) passwordInput.addEventListener("input", checkPasswordStrength);
    }
    if (forgotForm) forgotForm.addEventListener("submit", handleForgotPassword);
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;
    const errorDiv = document.getElementById("loginError");
    const successDiv = document.getElementById("loginSuccess");

    hideMessage(errorDiv); hideMessage(successDiv);

    if (!email || !password) return showError(errorDiv, "Please fill in all fields");
    if (!isValidEmail(email)) return showError(errorDiv, "Please enter a valid email address");

    const users = JSON.parse(localStorage.getItem("payrollUsers") || "[]");
    if (!users.length) {
        users.push({
            id:1, email:"admin@payroll.com", password:hashPassword("admin123"),
            firstName:"Admin", lastName:"User", company:"Demo Company",
            createdAt:new Date().toISOString()
        });
        localStorage.setItem("payrollUsers", JSON.stringify(users));
    }

    const user = users.find(u => u.email === email && u.password === hashPassword(password));
    if (!user) return showError(errorDiv, "Invalid email or password");

    localStorage.setItem("currentUser", JSON.stringify({
        id:user.id,email:user.email,firstName:user.firstName,lastName:user.lastName,
        company:user.company,loginTime:new Date().toISOString()
    }));

    if (rememberMe) localStorage.setItem("rememberEmail", email);
    showSuccess(successDiv, "Login successful! Redirecting...");
    setTimeout(() => window.location.href = "index.html", 700);
}

function handleSignup(e) {
    e.preventDefault();
    const firstName = document.getElementById("signupFirstName").value.trim();
    const lastName = document.getElementById("signupLastName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const company = document.getElementById("signupCompany").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms").checked;
    const errorDiv = document.getElementById("signupError");
    const successDiv = document.getElementById("signupSuccess");

    hideMessage(errorDiv); hideMessage(successDiv);

    if (!firstName || !lastName || !email || !company || !password || !confirmPassword)
        return showError(errorDiv, "Please fill in all fields");
    if (!isValidEmail(email)) return showError(errorDiv, "Please enter a valid email address");
    if (password.length < 6) return showError(errorDiv, "Password must be at least 6 characters long");
    if (password !== confirmPassword) return showError(errorDiv, "Passwords do not match");
    if (!agreeTerms) return showError(errorDiv, "Please agree to the Terms and Conditions");

    const users = JSON.parse(localStorage.getItem("payrollUsers") || "[]");
    if (users.some(u => u.email === email))
        return showError(errorDiv, "This email is already registered. Please login instead.");

    const newUser = {
        id: users.length ? Math.max(...users.map(u => Number(u.id)||0)) + 1 : 1,
        firstName,lastName,email,company,password:hashPassword(password),
        createdAt:new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem("payrollUsers", JSON.stringify(users));
    localStorage.setItem(`employees_${newUser.id}`, JSON.stringify([]));

    showSuccess(successDiv, "Account created successfully! Redirecting to login...");
    setTimeout(() => window.location.href = "login.html", 1000);
}

function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
    const newPassword = document.getElementById("newPassword").value;
    const ok = document.getElementById("forgotMessage");
    const err = document.getElementById("forgotError");
    hideMessage(ok); hideMessage(err);

    if (!isValidEmail(email)) return showError(err, "Please enter a valid email address");
    if (newPassword.length < 6) return showError(err, "Password must be at least 6 characters long");

    const users = JSON.parse(localStorage.getItem("payrollUsers") || "[]");
    const user = users.find(u => u.email === email);
    if (!user) return showError(err, "No account found with this email address");

    user.password = hashPassword(newPassword);
    localStorage.setItem("payrollUsers", JSON.stringify(users));
    showSuccess(ok, "Password reset successfully. You can now login.");
}

function checkPasswordStrength() {
    const password = document.getElementById("signupPassword").value;
    const strengthDiv = document.getElementById("passwordStrength");
    if (!password) { strengthDiv.textContent = ""; return; }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    const result = [
        ["", ""],["Weak password","#e74c3c"],["Fair password","#f39c12"],
        ["Good password","#f1c40f"],["Strong password","#27ae60"],["Very strong password","#27ae60"]
    ][score];
    strengthDiv.textContent = result[0];
    strengthDiv.style.color = result[1];
}

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function hashPassword(password) {
    let hash = 0;
    for (let i=0;i<password.length;i++) {
        hash = ((hash << 5) - hash) + password.charCodeAt(i);
        hash |= 0;
    }
    return "hash_" + Math.abs(hash).toString(16);
}

function showError(el,msg) { el.textContent=msg; el.style.display="block"; }
function showSuccess(el,msg) { el.textContent=msg; el.style.display="block"; }
function hideMessage(el) { if(el) el.style.display="none"; }

document.addEventListener("DOMContentLoaded", function() {
    const loginEmail = document.getElementById("loginEmail");
    if (loginEmail) {
        const remembered = localStorage.getItem("rememberEmail");
        if (remembered) loginEmail.value = remembered;
    }
});
