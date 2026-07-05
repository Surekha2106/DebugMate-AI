// Profile module logic
document.addEventListener("DOMContentLoaded", () => {
    requireAuth();
    setupSidebarProfile();

    const navItem = document.getElementById("nav-profile");
    if (navItem) navItem.classList.add("active");

    // Load initial profile data
    loadUserProfile();

    // Bind form submit
    document.getElementById("profile-form").addEventListener("submit", handleProfileUpdate);
});

async function loadUserProfile() {
    try {
        const response = await fetchWithAuth("/profile");
        if (!response) return;

        const data = await response.json();
        
        document.getElementById("profile-name").value = data.name || "";
        document.getElementById("profile-email").value = data.email || "";
        
        // Format join date
        const joinDate = new Date(data.createdDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById("profile-join-date").textContent = `Member since ${joinDate}`;
    } catch (err) {
        console.error("Error loading profile:", err);
        showToast("Failed to load profile details.", "error");
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    const name = document.getElementById("profile-name").value;
    const email = document.getElementById("profile-email").value;
    const currentPassword = document.getElementById("profile-current-pass").value;
    const newPassword = document.getElementById("profile-new-pass").value;

    const payload = {
        name,
        email
    };

    // If changing password, validation
    if (currentPassword || newPassword) {
        if (!currentPassword || !newPassword) {
            showToast("Both current and new passwords are required to update password.", "error");
            return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
    }

    const submitBtn = e.target.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving Changes...";

    try {
        const response = await fetchWithAuth("/profile", {
            method: "PUT",
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        submitBtn.disabled = false;
        submitBtn.textContent = "Save Changes";

        if (response.ok) {
            // Update local storage
            localStorage.setItem("user_name", data.name);
            localStorage.setItem("user_email", data.email);
            
            // Re-render sidebar details
            setupSidebarProfile();
            
            // Reset password fields
            document.getElementById("profile-current-pass").value = "";
            document.getElementById("profile-new-pass").value = "";

            showToast("Profile updated successfully!", "success");
        } else {
            showToast(data.message || "Failed to update profile", "error");
        }
    } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Changes";
        showToast("Error updating profile details.", "error");
    }
}
