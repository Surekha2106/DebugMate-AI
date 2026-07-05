// Dashboard logic
document.addEventListener("DOMContentLoaded", () => {
    // Check authentication
    requireAuth();
    
    // Setup Sidebar Profile Information
    setupSidebarProfile();

    // Set Active State in Sidebar Navigation
    const navItem = document.getElementById("nav-dashboard");
    if (navItem) navItem.classList.add("active");

    // Load Dashboard Data
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const response = await fetchWithAuth("/history");
        if (!response) return;

        const history = await response.json();
        
        // Update Statistics Cards
        updateStats(history);

        // Populate Recent Sessions Table
        populateRecentSessions(history);
    } catch (err) {
        console.error("Error loading dashboard data:", err);
        showToast("Failed to load dashboard data.", "error");
    }
}

function updateStats(history) {
    const totalSessionsEl = document.getElementById("stat-total-sessions");
    const errorsResolvedEl = document.getElementById("stat-errors-resolved");
    const activeLanguagesEl = document.getElementById("stat-active-languages");
    
    if (!totalSessionsEl) return;

    // Total Sessions count
    const totalSessions = history.length;
    totalSessionsEl.textContent = totalSessions;

    // Calculate total bugs resolved (detected errors in history)
    let totalBugs = 0;
    const languages = new Set();

    history.forEach(session => {
        if (session.language) {
            languages.add(session.language.toLowerCase());
        }
        if (session.aiResponse && session.aiResponse.detectedErrors) {
            totalBugs += session.aiResponse.detectedErrors.length;
        }
    });

    errorsResolvedEl.textContent = totalBugs;
    activeLanguagesEl.textContent = languages.size;
}

function populateRecentSessions(history) {
    const tbody = document.getElementById("recent-sessions-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (history.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                    No debug sessions found. Start by debugging some code!
                </td>
            </tr>
        `;
        return;
    }

    // Limit to 5 recent sessions
    const recent = history.slice(0, 5);

    recent.forEach(session => {
        const row = document.createElement("tr");
        
        const date = new Date(session.createdDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const langBadge = getLanguageBadgeClass(session.language);
        const errorCount = session.aiResponse && session.aiResponse.detectedErrors 
            ? session.aiResponse.detectedErrors.length 
            : 0;

        row.innerHTML = `
            <td><strong>${date}</strong></td>
            <td><span class="badge ${langBadge}">${session.language}</span></td>
            <td>${errorCount} Issues Found</td>
            <td style="text-align: right;">
                <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="viewSessionDetails('${session.id}')">
                    View
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getLanguageBadgeClass(lang) {
    if (!lang) return "";
    lang = lang.toLowerCase();
    if (lang === "javascript" || lang === "typescript" || lang === "js" || lang === "ts") return "badge-js";
    if (lang === "python" || lang === "py") return "badge-py";
    if (lang === "java") return "badge-java";
    if (lang === "cpp" || lang === "c++" || lang === "c") return "badge-cpp";
    return "";
}

function viewSessionDetails(sessionId) {
    // Save selected session id and redirect to history page
    localStorage.setItem("selected_session_id", sessionId);
    window.location.href = "history.html";
}
