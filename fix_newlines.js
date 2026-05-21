const fs = require('fs');
let c = fs.readFileSync('client/src/data/mockData.js', 'utf8');
// Replace literal backslash followed by 'n' with actual newline
c = c.replace(/\\n/g, '\n');
fs.writeFileSync('client/src/data/mockData.js', c, 'utf8');
console.log('Fixed literal newlines!');
