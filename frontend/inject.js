const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const ts = Date.now();
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add div
    if (!content.includes('<div id="color-bends-bg"></div>')) {
        content = content.replace('<body>', '<body>\n    <div id="color-bends-bg"></div>');
    }
    
    // Add scripts
    if (!content.includes('colorBends.js')) {
        content = content.replace('</body>', '    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.154.0/three.min.js"></script>\n    <script src="js/colorBends.js?v=' + ts + '"></script>\n</body>');
    } else {
        content = content.replace(/colorBends\.js(\?v=\d+)?/, 'colorBends.js?v=' + ts);
    }
    
    fs.writeFileSync(file, content, 'utf8');
});

// Update style.css
let stylePath = 'css/style.css';
let style = fs.readFileSync(stylePath, 'utf8');

// Add the #color-bends-bg css if not exists
if (!style.includes('#color-bends-bg')) {
    style += '\n\n/* WebGL Background Container */\n#color-bends-bg {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100vw;\n    height: 100vh;\n    z-index: -2;\n    pointer-events: none;\n}\n';
    fs.writeFileSync(stylePath, style, 'utf8');
}
console.log('Injected successfully');
