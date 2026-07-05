document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle-btn';
    toggleBtn.innerHTML = '🌙';
    toggleBtn.title = 'Toggle Theme';
    
    // Add basic styles to the button
    Object.assign(toggleBtn.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: '1px solid var(--border-glass)',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(10px)',
        color: 'var(--text-primary)',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: 'var(--glow-purple)',
        zIndex: '1000',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    toggleBtn.onmouseover = () => toggleBtn.style.transform = 'scale(1.1)';
    toggleBtn.onmouseout = () => toggleBtn.style.transform = 'scale(1)';

    document.body.appendChild(toggleBtn);

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    toggleBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';

    // Dispatch custom event for colorBends to pick up
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: savedTheme }));
    }, 100);

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toggleBtn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';

        window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
    });
});
