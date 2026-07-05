const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const ts = Date.now();
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/href="([a-zA-Z0-9_-]+)\.html(\?v=\d+)?"/g, 'href="$1.html?v=' + ts + '"');
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Appended cache bust to links');
