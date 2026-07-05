const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find the script tags
    const threeRegex = /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/0\.154\.0\/three\.min\.js"><\/script>\r?\n\s*/g;
    const colorBendsRegex = /<script src="js\/colorBends\.js\?v=\d+"><\/script>\r?\n\s*/g;
    
    // Remove them from their current positions
    let newContent = content.replace(threeRegex, '');
    newContent = newContent.replace(colorBendsRegex, '');
    
    // Now insert them right BEFORE the auth.js script
    const authRegex = /(<script src="js\/auth\.js"><\/script>)/;
    
    const ts = Date.now();
    const scriptsToInsert = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.154.0/three.min.js"></script>\n    <script src="js/colorBends.js?v=' + ts + '"></script>\n    $1';
    
    newContent = newContent.replace(authRegex, scriptsToInsert);
    
    fs.writeFileSync(file, newContent, 'utf8');
});
console.log('Reordered script tags to avoid AMD conflicts');
