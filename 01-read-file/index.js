const fs = require('fs');
const path = require('path');

const fullPath = path.join(__dirname, 'text.txt');
let stream = fs.createReadStream(fullPath);

stream.on('data', chunk => {
  process.stdout.write(chunk);
});
