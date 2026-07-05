// Settings and Snippets logic
let savedSnippets = [];
let snippetDetailEditor = null;

document.addEventListener("DOMContentLoaded", () => {
    requireAuth();
    setupSidebarProfile();

    const navItem = document.getElementById("nav-settings");
    if (navItem) navItem.classList.add("active");

    // Load Snippets
    loadSavedSnippets();

    // Event listeners
    document.getElementById("btn-close-snippet-modal").addEventListener("click", closeSnippetDetailModal);
    document.getElementById("btn-copy-saved-snippet").addEventListener("click", copySavedSnippetCode);
    
    // Close modal trigger
    document.getElementById("snippet-view-modal").addEventListener("click", (e) => {
        if (e.target.id === "snippet-view-modal") {
            closeSnippetDetailModal();
        }
    });

    // Handle Custom Settings options
    loadCustomSettings();
    document.getElementById("settings-config-form").addEventListener("submit", saveLocalConfig);
});

async function loadSavedSnippets() {
    try {
        const response = await fetchWithAuth("/snippets");
        if (!response) return;

        savedSnippets = await response.json();
        renderSnippetsGrid(savedSnippets);
    } catch (err) {
        console.error("Error loading snippets:", err);
        showToast("Failed to load saved snippets.", "error");
    }
}

function renderSnippetsGrid(snippets) {
    const grid = document.getElementById("snippets-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (snippets.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;" class="glass-panel">
                <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">💾</span>
                <h4>No Saved Snippets</h4>
                <p style="font-size: 0.85rem; margin-top: 6px;">You can save snippets from the workspace during code analysis.</p>
            </div>
        `;
        return;
    }

    snippets.forEach(snippet => {
        const card = document.createElement("div");
        card.className = "glass-panel";
        card.style.padding = "20px";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.gap = "12px";

        const date = new Date(snippet.createdDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h4 style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px;" title="${snippet.title}">${snippet.title}</h4>
                <span class="badge ${getLanguageBadgeClass(snippet.language)}" style="font-size: 0.7rem;">${snippet.language}</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-muted);">Saved: ${date}</p>
            <div style="margin-top: auto; display: flex; gap: 8px;">
                <button class="btn-secondary" style="flex-grow: 1; padding: 6px; font-size: 0.8rem;" onclick="viewSnippetDetail('${snippet.id}')">View</button>
                <button class="btn-secondary" style="padding: 6px 10px; font-size: 0.8rem; border-color: rgba(239, 68, 68, 0.2); color: var(--accent-error);" onclick="deleteSnippet('${snippet.id}')">🗑️</button>
            </div>
        `;
        grid.appendChild(card);
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

function viewSnippetDetail(snippetId) {
    const snippet = savedSnippets.find(s => s.id === snippetId);
    if (!snippet) return;

    const modal = document.getElementById("snippet-view-modal");
    modal.style.display = "flex";

    document.getElementById("modal-snippet-title").textContent = snippet.title;

    // Load Monaco editor inside details modal
    initSnippetModalMonaco(snippet.code, snippet.language);
}

function initSnippetModalMonaco(code, language) {
    const container = document.getElementById("modal-snippet-editor");
    container.innerHTML = "";
    container.style.height = "300px";

    if (typeof require === "undefined") {
        container.innerHTML = `
            <textarea class="fallback-editor" readonly style="height: 300px;">${code}</textarea>
        `;
        return;
    }

    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        snippetDetailEditor = monaco.editor.create(container, {
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

function closeSnippetDetailModal() {
    document.getElementById("snippet-view-modal").style.display = "none";
    if (snippetDetailEditor) {
        snippetDetailEditor.dispose();
        snippetDetailEditor = null;
    }
}

function copySavedSnippetCode() {
    let code = "";
    if (snippetDetailEditor) {
        code = snippetDetailEditor.getValue();
    } else {
        const textarea = document.querySelector("#modal-snippet-editor textarea");
        code = textarea ? textarea.value : "";
    }

    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
        showToast("Snippet code copied to clipboard!", "success");
    }).catch(() => {
        showToast("Copy failed.", "error");
    });
}

async function deleteSnippet(snippetId) {
    if (!confirm("Are you sure you want to delete this saved snippet?")) {
        return;
    }

    try {
        const response = await fetchWithAuth(`/snippet/${snippetId}`, {
            method: "DELETE"
        });

        if (response && response.ok) {
            showToast("Snippet deleted.", "success");
            loadSavedSnippets();
        } else {
            showToast("Failed to delete snippet.", "error");
        }
    } catch (err) {
        showToast("Error communicating with database.", "error");
    }
}

// Local configs preferences
function loadCustomSettings() {
    const themeGlow = localStorage.getItem("pref_theme_glow") !== "false";
    document.getElementById("theme-glow-toggle").checked = themeGlow;
}

function saveLocalConfig(e) {
    e.preventDefault();
    const themeGlow = document.getElementById("theme-glow-toggle").checked;
    localStorage.setItem("pref_theme_glow", themeGlow);
    showToast("Preferences saved successfully!", "success");
}
