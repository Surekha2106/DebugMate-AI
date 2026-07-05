const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('theme.js')) {
        content = content.replace('</head>', '    <script src="js/theme.js"></script>\n</head>');
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Injected theme.js into HTML files');
