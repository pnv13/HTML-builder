const fs = require('fs');
const path = require('path');
const { stdout, stdin } = require('process');

const fullPath = path.join(__dirname, 'text.txt');
const textFile = fs.createWriteStream(fullPath);

stdout.write('Hi all, write some text: ');
process.on('SIGINT', () => process.exit());
stdin.on('data', data => {
  const enterData = data.toString();
  const exitData = enterData.trim();
  exitData === 'exit' ? process.exit() : textFile.write(data);
});
process.on('exit', () => stdout.write('Good buy'));
