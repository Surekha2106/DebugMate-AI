// History module logic
let historySessions = [];
let detailEditor = null;

document.addEventListener("DOMContentLoaded", () => {
    requireAuth();
    setupSidebarProfile();

    const navItem = document.getElementById("nav-history");
    if (navItem) navItem.classList.add("active");

    // Load History list
    loadHistoryList();

    // Event listeners
    document.querySelector(".modal-overlay").addEventListener("click", (e) => {
        if (e.target.classList.contains("modal-overlay")) {
            closeDetailModal();
        }
    });

    document.getElementById("btn-close-modal").addEventListener("click", closeDetailModal);
    document.getElementById("btn-copy-history").addEventListener("click", copyHistoryOptimizedCode);
});

async function loadHistoryList() {
    try {
        const response = await fetchWithAuth("/history");
        if (!response) return;

        historySessions = await response.json();
        
        populateHistoryTable(historySessions);

        // Check if redirected from dashboard with a specific session selected
        const autoSessionId = localStorage.getItem("selected_session_id");
        if (autoSessionId) {
            localStorage.removeItem("selected_session_id");
            viewSession(autoSessionId);
        }
    } catch (err) {
        console.error("Error loading history:", err);
        showToast("Failed to load debug history.", "error");
    }
}

function populateHistoryTable(sessions) {
    const tbody = document.getElementById("history-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (sessions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 45px;">
                    No past sessions found. Start by analyzing code in the editor!
                </td>
            </tr>
        `;
        return;
    }

    sessions.forEach(session => {
        const row = document.createElement("tr");

        const date = new Date(session.createdDate).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
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
            <td>${errorCount} Bugs Found</td>
            <td><span style="font-family: monospace; font-size: 0.8rem; color: var(--text-secondary); max-width: 150px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${session.inputCode.split('\n')[0]}</span></td>
            <td style="text-align: right; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="viewSession('${session.id}')">
                    Inspect
                </button>
                <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; border-color: rgba(239, 68, 68, 0.2); color: var(--accent-error);" onclick="deleteSession('${session.id}')">
                    Delete
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

function viewSession(sessionId) {
    const session = historySessions.find(s => s.id === sessionId);
    if (!session) return;

    // Open Modal
    const modal = document.getElementById("history-detail-modal");
    modal.style.display = "flex";

    // Header Language Info
    document.getElementById("modal-title").innerHTML = `Inspection: <span class="badge ${getLanguageBadgeClass(session.language)}">${session.language}</span> Session`;

    const ai = session.aiResponse;
    if (!ai) {
        document.getElementById("modal-summary").textContent = "No analysis data available.";
        return;
    }

    // Populate Summary
    document.getElementById("modal-summary").textContent = ai.summary || "No executive summary.";

    // Populate Errors
    const errorsList = document.getElementById("modal-errors");
    errorsList.innerHTML = "";
    if (!ai.detectedErrors || ai.detectedErrors.length === 0) {
        errorsList.innerHTML = `<p style="color: var(--accent-success); font-weight: 600;">No errors found.</p>`;
    } else {
        ai.detectedErrors.forEach(err => {
            const card = document.createElement("div");
            card.className = "error-card";
            card.innerHTML = `
                <div class="error-card-header">
                    <span>Line ${err.line || 'N/A'}: ${err.error || 'Syntax Warning'}</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px;"><strong>Explain:</strong> ${err.explanation}</p>
                <p style="font-size: 0.85rem; color: var(--text-primary);"><strong>Suggestion:</strong> ${err.suggestion}</p>
            `;
            errorsList.appendChild(card);
        });
    }

    // Complexity
    const complexityEl = document.getElementById("modal-complexity");
    if (ai.complexityAnalysis) {
        complexityEl.innerHTML = `
            <strong>Time:</strong> <span style="color: var(--accent-cyan); font-family: monospace;">${ai.complexityAnalysis.time || 'N/A'}</span><br>
            <strong>Space:</strong> <span style="color: var(--accent-purple); font-family: monospace;">${ai.complexityAnalysis.space || 'N/A'}</span>
        `;
    } else {
        complexityEl.textContent = "Complexity data unavailable.";
    }

    // Best practices
    const practicesList = document.getElementById("modal-practices");
    practicesList.innerHTML = "";
    if (ai.bestPractices && ai.bestPractices.length > 0) {
        ai.bestPractices.forEach(p => {
            const li = document.createElement("li");
            li.style.color = "var(--text-secondary)";
            li.style.fontSize = "0.85rem";
            li.style.marginBottom = "6px";
            li.textContent = p;
            practicesList.appendChild(li);
        });
    } else {
        practicesList.innerHTML = `<li style="color: var(--text-muted);">No recommendations.</li>`;
    }

    // Initialize Monaco optimized viewer if available, else fallback
    initModalMonaco(ai.optimizedCode || "", session.language);
}

function initModalMonaco(code, language) {
    if (typeof require === "undefined") {
        document.getElementById("modal-optimized-editor").innerHTML = `
            <textarea class="fallback-editor" readonly style="height: 250px;">${code}</textarea>
        `;
        return;
    }

    // Set height and clear
    const container = document.getElementById("modal-optimized-editor");
    container.innerHTML = "";
    container.style.height = "250px";

    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        detailEditor = monaco.editor.create(container, {
            value: code,
            language: language.toLowerCase(),
            theme: 'vs-dark',
            readOnly: true,
            automaticLayout: true,
            fontFamily: 'Plus Jakarta Sans, Consolas, monospace',
            fontSize: 13,
            minimap: { enabled: false }
        });
    });
}

function closeDetailModal() {
    document.getElementById("history-detail-modal").style.display = "none";
    if (detailEditor) {
        detailEditor.dispose();
        detailEditor = null;
    }
}

function copyHistoryOptimizedCode() {
    let code = "";
    if (detailEditor) {
        code = detailEditor.getValue();
    } else {
        const textarea = document.querySelector("#modal-optimized-editor textarea");
        code = textarea ? textarea.value : "";
    }

    if (!code) {
        showToast("No code to copy.", "error");
        return;
    }

    navigator.clipboard.writeText(code).then(() => {
        showToast("Code copied to clipboard!", "success");
    }).catch(() => {
        showToast("Copy failed.", "error");
    });
}

async function deleteSession(sessionId) {
    if (!confirm("Are you sure you want to permanently delete this debug session?")) {
        return;
    }

    try {
        const response = await fetchWithAuth(`/history/${sessionId}`, {
            method: "DELETE"
        });

        if (response && response.ok) {
            showToast("Session deleted successfully.", "success");
            loadHistoryList();
        } else {
            showToast("Failed to delete session.", "error");
        }
    } catch (err) {
        showToast("Error deleting session.", "error");
    }
}
