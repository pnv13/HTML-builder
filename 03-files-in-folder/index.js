const fs = require('fs');
const path = require('path');

const fullFolderPath = path.join(__dirname, 'secret-folder');

fs.readdir(fullFolderPath, { withFileTypes: true }, (err, files) => {
  if (err) {
    throw new Error('Error with readFile');
  }
  const results = files.filter(file => {
    if (file.isFile()) return file;
  });
  const filesPath = results.map(file => path.join(fullFolderPath, file.name));
  filesPath.forEach(file => {
    const fileInfo = path.parse(file);
    fs.stat(file, (err, stats) => {
      if (err) {
        throw new Error('Error in stats');
      }
      console.log(`${fileInfo.name} - ${fileInfo.ext.slice(1)} - ${stats['size'] / 1000}kb`);
    });
  });
});