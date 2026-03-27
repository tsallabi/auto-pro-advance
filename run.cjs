const fs = require('fs');
let content = fs.readFileSync('import_cars.cjs', 'utf-8');
content = content.replace(/\\\\n/g, '\\n').replace(/\\\\t/g, '\\t');
fs.writeFileSync('import_cars.cjs', content);
require('./import_cars.cjs');
