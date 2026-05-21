const fs = require('fs');
let c = fs.readFileSync('client/src/data/mockData.js', 'utf8');
c = c.replace(/\\\\'/g, "\\'");
fs.writeFileSync('client/src/data/mockData.js', c, 'utf8');
console.log("Quotes fixed!");
