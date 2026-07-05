const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const ts = Date.now();
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/css\/style\.css\?v=\d+/g, 'css/style.css?v=' + ts);
    content = content.replace(/js\/colorBends\.js\?v=\d+/g, 'js/colorBends.js?v=' + ts);
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Appended cache bust to assets');
