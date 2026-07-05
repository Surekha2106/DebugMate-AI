// Auth state management and API wrappers
const API_BASE = window.location.port === "8080" ? "" : "http://localhost:8080";

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem("jwt_token") !== null;
}

// Redirect guards
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

function requireNoAuth() {
    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
    }
}

// Authenticated fetch wrapper
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const headers = options.headers || {};
    headers["Authorization"] = `Bearer ${token}`;
    headers["Content-Type"] = "application/json";
    const updatedOptions = { ...options, headers };

    try {
        const finalUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
        const response = await fetch(finalUrl, updatedOptions);
        
        if (response.status === 401) {
            // Token expired or invalid, log out
            logout();
            return null;
        }
        
        return response;
    } catch (err) {
        console.error("Fetch request failed:", err);
        showToast("Network error occurred. Please try again.", "error");
        throw err;
    }
}

// Login
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("jwt_token", data.token);
            localStorage.setItem("user_email", data.email);
            localStorage.setItem("user_name", data.name);
            showToast("Login successful!", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
            return true;
        } else {
            showToast(data.message || "Invalid credentials", "error");
            return false;
        }
    } catch (err) {
        showToast("Login failed. Check server connection.", "error");
        return false;
    }
}

// Signup
async function signup(name, email, password) {
    try {
        const response = await fetch(`${API_BASE}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("jwt_token", data.token);
            localStorage.setItem("user_email", data.email);
            localStorage.setItem("user_name", data.name);
            showToast("Account created successfully!", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
            return true;
        } else {
            showToast(data.message || data.email || data.password || "Registration failed", "error");
            return false;
        }
    } catch (err) {
        showToast("Registration failed. Check server connection.", "error");
        return false;
    }
}

// Logout
function logout() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    window.location.href = "login.html";
}

// Toast Notifications Manager
function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toast-in 0.3s reverse forwards";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// Render sidebar profile details dynamically
function setupSidebarProfile() {
    const nameEl = document.querySelector(".user-name");
    const emailEl = document.querySelector(".user-email");
    const avatarEl = document.querySelector(".user-avatar");
    
    const storedName = localStorage.getItem("user_name") || "Developer";
    const storedEmail = localStorage.getItem("user_email") || "dev@debugmate.ai";

    if (nameEl) nameEl.textContent = storedName;
    if (emailEl) emailEl.textContent = storedEmail;
    if (avatarEl) avatarEl.textContent = storedName.charAt(0).toUpperCase();
}
