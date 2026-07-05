// Debug Module Logic
let editor = null;
let optimizedEditor = null;
let currentAiResponse = null;

document.addEventListener("DOMContentLoaded", () => {
    requireAuth();
    setupSidebarProfile();

    const navItem = document.getElementById("nav-new-debug");
    if (navItem) navItem.classList.add("active");

    // Initialize Monaco Editor
    initMonaco();

    // Event Listeners
    document.getElementById("language-select").addEventListener("change", handleLanguageChange);
    document.getElementById("file-upload").addEventListener("change", handleFileUpload);
    document.getElementById("btn-analyze").addEventListener("click", analyzeCode);
    document.getElementById("btn-clear").addEventListener("click", clearEditor);
    document.getElementById("btn-copy-opt").addEventListener("click", copyOptimizedCode);
    document.getElementById("btn-download-rep").addEventListener("click", downloadReport);
    document.getElementById("btn-save-snippet").addEventListener("click", openSaveSnippetModal);
    document.getElementById("save-snippet-form").addEventListener("submit", saveCurrentSnippet);
    
    // Close modal trigger
    document.querySelector(".modal-overlay").addEventListener("click", (e) => {
        if (e.target.classList.contains("modal-overlay")) {
            closeModal();
        }
    });
});

// Initialize Monaco Editors
function initMonaco() {
    if (typeof require === "undefined") {
        setupFallbackTextarea();
        return;
    }

    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        monaco.editor.defineTheme('glass-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#00000000', // Transparent
                'editor.lineHighlightBackground': '#ffffff0a',
                'editorLineNumber.foreground': '#6b7280',
                'editorIndentGuide.background': '#ffffff10'
            }
        });

        // Create Main Editor
        editor = monaco.editor.create(document.getElementById('editor-container'), {
            value: '// Paste or write your buggy code here...\nfunction addNum(a, b) {\n    return a == b;\n}',
            language: 'javascript',
            theme: 'glass-theme',
            automaticLayout: true,
            fontFamily: 'Plus Jakarta Sans, Consolas, monospace',
            fontSize: 14,
            minimap: { enabled: false }
        });

        // Create Optimized Code Editor (read-only)
        optimizedEditor = monaco.editor.create(document.getElementById('optimized-editor-container'), {
            value: '// Optimized code will appear here after analysis...',
            language: 'javascript',
            theme: 'glass-theme',
            readOnly: true,
            automaticLayout: true,
            fontFamily: 'Plus Jakarta Sans, Consolas, monospace',
            fontSize: 14,
            minimap: { enabled: false }
        });
    });
}

function setupFallbackTextarea() {
    document.getElementById('editor-container').innerHTML = `
        <textarea id="fallback-editor" class="fallback-editor" placeholder="Paste your code here..."></textarea>
    `;
    document.getElementById('optimized-editor-container').innerHTML = `
        <textarea id="fallback-opt-editor" class="fallback-editor" readonly placeholder="Optimized code will appear here..."></textarea>
    `;
}

function getCodeValue() {
    if (editor) {
        return editor.getValue();
    } else {
        const textarea = document.getElementById("fallback-editor");
        return textarea ? textarea.value : "";
    }
}

function setCodeValue(val) {
    if (editor) {
        editor.setValue(val);
    } else {
        const textarea = document.getElementById("fallback-editor");
        if (textarea) textarea.value = val;
    }
}

function setOptimizedCodeValue(val, lang) {
    if (optimizedEditor) {
        optimizedEditor.setValue(val);
        if (lang) {
            monaco.editor.setModelLanguage(optimizedEditor.getModel(), lang);
        }
    } else {
        const textarea = document.getElementById("fallback-opt-editor");
        if (textarea) textarea.value = val;
    }
}

function handleLanguageChange() {
    const lang = document.getElementById("language-select").value;
    if (editor) {
        monaco.editor.setModelLanguage(editor.getModel(), lang);
    }
    if (optimizedEditor) {
        monaco.editor.setModelLanguage(optimizedEditor.getModel(), lang);
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Detect language from extension
    const ext = file.name.split('.').pop().toLowerCase();
    let lang = "javascript";
    if (ext === "py") lang = "python";
    if (ext === "java") lang = "java";
    if (ext === "cpp" || ext === "cc" || ext === "h" || ext === "c") lang = "cpp";
    
    document.getElementById("language-select").value = lang;

    const reader = new FileReader();
    reader.onload = function(evt) {
        setCodeValue(evt.target.result);
        handleLanguageChange();
        showToast(`Uploaded ${file.name} successfully.`, "success");
    };
    reader.readAsText(file);
}

function clearEditor() {
    setCodeValue("");
    setOptimizedCodeValue("// Optimized code will appear here after analysis...", "javascript");
    currentAiResponse = null;
    document.getElementById("report-output-panel").style.display = "none";
    document.getElementById("empty-report-state").style.display = "flex";
    showToast("Editor cleared.", "info");
}

async function analyzeCode() {
    const code = getCodeValue();
    const language = document.getElementById("language-select").value;

    if (!code || code.trim().isEmpty || code.startsWith("// Paste or write")) {
        showToast("Please enter some code to analyze.", "error");
        return;
    }

    // Show Loader
    document.getElementById("loading-overlay").style.display = "flex";

    try {
        const response = await fetchWithAuth("/debug", {
            method: "POST",
            body: JSON.stringify({ code, language })
        });

        if (!response) {
            document.getElementById("loading-overlay").style.display = "none";
            return;
        }

        const data = await response.json();
        
        document.getElementById("loading-overlay").style.display = "none";

        if (response.ok) {
            currentAiResponse = data.aiResponse;
            displayReport(data.aiResponse, language);
            showToast("Analysis complete!", "success");
        } else {
            showToast(data.message || "Failed to analyze code", "error");
        }
    } catch (err) {
        document.getElementById("loading-overlay").style.display = "none";
        
    }
}

function displayReport(aiResponse, language) {
    document.getElementById("empty-report-state").style.display = "none";
    const reportPanel = document.getElementById("report-output-panel");
    reportPanel.style.display = "flex";

    // 1. Summary
    document.getElementById("report-summary").textContent = aiResponse.summary || "No description provided.";

    // 2. Detected Errors
    const errorsList = document.getElementById("report-errors");
    errorsList.innerHTML = "";
    
    if (!aiResponse.detectedErrors || aiResponse.detectedErrors.length === 0) {
        errorsList.innerHTML = `
            <div class="glass-panel" style="padding: 16px; border-color: var(--accent-success); background: rgba(16, 185, 129, 0.05);">
                <p style="color: var(--accent-success); font-weight: 600;">No errors detected by Gemini. Excellent job!</p>
            </div>
        `;
    } else {
        aiResponse.detectedErrors.forEach(err => {
            const card = document.createElement("div");
            card.className = "error-card";
            card.style.cursor = "pointer";
            card.onclick = () => jumpToLine(err.line);
            
            card.innerHTML = `
                <div class="error-card-header">
                    <span>Line ${err.line || 'N/A'}: ${err.error || 'Syntax Error'}</span>
                    <span style="font-size: 0.75rem; background: rgba(239, 68, 68, 0.2); padding: 2px 6px; border-radius: 4px;">Bug</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px;"><strong>Explain:</strong> ${err.explanation}</p>
                <p style="font-size: 0.85rem; color: var(--text-primary);"><strong>Suggestion:</strong> ${err.suggestion}</p>
            `;
            errorsList.appendChild(card);
        });
    }

    // 3. Complexity Analysis
    const complexityVal = document.getElementById("report-complexity");
    if (aiResponse.complexityAnalysis) {
        complexityVal.innerHTML = `
            <strong>Time Complexity:</strong> <span style="color: var(--accent-cyan); font-family: monospace;">${aiResponse.complexityAnalysis.time || 'N/A'}</span><br>
            <strong>Space Complexity:</strong> <span style="color: var(--accent-purple); font-family: monospace;">${aiResponse.complexityAnalysis.space || 'N/A'}</span>
        `;
    } else {
        complexityVal.textContent = "Complexity data unavailable.";
    }

    // 4. Best Practices
    const practicesList = document.getElementById("report-best-practices");
    practicesList.innerHTML = "";
    if (aiResponse.bestPractices && aiResponse.bestPractices.length > 0) {
        aiResponse.bestPractices.forEach(p => {
            const li = document.createElement("li");
            li.style.color = "var(--text-secondary)";
            li.style.fontSize = "0.85rem";
            li.style.marginBottom = "6px";
            li.textContent = p;
            practicesList.appendChild(li);
        });
    } else {
        practicesList.innerHTML = `<li style="color: var(--text-muted);">No suggestions.</li>`;
    }

    // 5. Optimized Code
    setOptimizedCodeValue(aiResponse.optimizedCode || "", language);
    if (optimizedEditor) {
        setTimeout(() => {
            optimizedEditor.layout();
        }, 100);
    }
}

function jumpToLine(line) {
    if (editor && line) {
        editor.revealLine(line);
        editor.setPosition({ lineNumber: line, column: 1 });
        editor.focus();
        showToast(`Selected line ${line}`, "info");
    }
}

function copyOptimizedCode() {
    let code = "";
    if (optimizedEditor) {
        code = optimizedEditor.getValue();
    } else {
        const textarea = document.getElementById("fallback-opt-editor");
        code = textarea ? textarea.value : "";
    }

    if (!code || code.startsWith("// Optimized code")) {
        showToast("No optimized code to copy.", "error");
        return;
    }

    navigator.clipboard.writeText(code).then(() => {
        showToast("Optimized code copied to clipboard!", "success");
    }).catch(() => {
        showToast("Copy failed.", "error");
    });
}

function downloadReport() {
    if (!currentAiResponse) {
        showToast("No active debugging report to download.", "error");
        return;
    }

    const reportText = `DEBUGMATE AI REPORT
==================
Created: ${new Date().toLocaleString()}
Language: ${document.getElementById("language-select").value}

SUMMARY:
--------
${currentAiResponse.summary}

COMPLEXITY ANALYSIS:
--------------------
Time: ${currentAiResponse.complexityAnalysis ? currentAiResponse.complexityAnalysis.time : 'N/A'}
Space: ${currentAiResponse.complexityAnalysis ? currentAiResponse.complexityAnalysis.space : 'N/A'}

DETECTED ERRORS:
----------------
${currentAiResponse.detectedErrors.map((err, i) => `${i+1}. Line ${err.line}: ${err.error}\n   Explanation: ${err.explanation}\n   Suggestion: ${err.suggestion}`).join('\n\n')}

BEST CODING PRACTICES:
----------------------
${currentAiResponse.bestPractices.map(p => `- ${p}`).join('\n')}

OPTIMIZED CODE:
---------------
${currentAiResponse.optimizedCode}
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `debugmate_report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Report downloaded successfully.", "success");
}

function openSaveSnippetModal() {
    const code = getCodeValue();
    if (!code || code.trim().isEmpty) {
        showToast("Editor is empty. Cannot save snippet.", "error");
        return;
    }

    document.getElementById("snippet-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("snippet-modal").style.display = "none";
}

async function saveCurrentSnippet(e) {
    e.preventDefault();
    const title = document.getElementById("snippet-title").value;
    const code = getCodeValue();
    const language = document.getElementById("language-select").value;

    try {
        const response = await fetchWithAuth("/save-snippet", {
            method: "POST",
            body: JSON.stringify({ title, code, language })
        });

        if (response && response.ok) {
            showToast("Snippet saved successfully!", "success");
            closeModal();
            document.getElementById("snippet-title").value = "";
        } else {
            showToast("Failed to save snippet.", "error");
        }
    } catch (err) {
        showToast("Error communicating with database.", "error");
    }
}
