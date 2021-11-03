const fs = require('fs');
const path = require('path');

const fullFolderPath = path.join(__dirname, 'files');
const newFolderPath = path.join(__dirname, 'files-copy');

const newFolderCreator = () => {
  fs.mkdir(newFolderPath, { recursive: true }, err => {
    if (err) throw new Error('Folder is created');

    fs.readdir(newFolderPath, (errFiles, files) => {
      if (errFiles) throw new Error(`Error with reading files in ${newFolderPath}`);

      files.forEach(file => {
        fs.access(path.join(fullFolderPath, file), err => {
          if (err) {
            fs.unlink(path.join(newFolderPath, file), deletingErr => {
              if (deletingErr) throw new Error(`Error with deleting file: ${file}`);
            });
          }
        });
      });
    });
  });
};

const readWriteStream = () => {
  fs.readdir(fullFolderPath, (err, files) => {
    if (err) throw new Error('Error with file');

    files.forEach(file => {
      const readStream = fs.createReadStream(path.join(fullFolderPath, file));
      const writeStream = fs.createWriteStream(path.join(newFolderPath, file));
      readStream.pipe(writeStream);
    });
  });
};

const copyFiles = async () => {
  await newFolderCreator();
  await readWriteStream();
};
copyFiles();
