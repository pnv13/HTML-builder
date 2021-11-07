const fs = require('fs');
const path = require('path');

const fullFolderPath = path.join(__dirname, 'files');
const newFolderPath = path.join(__dirname, 'files-copy');

const newFolderCreator = (fullFolderPath, newFolderPath) => {
  fs.mkdir(newFolderPath, { recursive: true }, err => {
    if (err) throw new Error('Folder is created');

    fs.readdir(newFolderPath, (errFiles, files) => {
      if (errFiles) throw new Error(`Error with reading files in ${newFolderPath}`);

      files.forEach(file => {
        fs.stat(path.join(newFolderPath, file), (errInfo, stats) => {
          if (errInfo) throw new Error(`Error with ${stats}`);

          if (stats.isFile()) {
            fs.access(path.join(fullFolderPath, file), err => {
              if (err) {
                fs.unlink(path.join(newFolderPath, file), deletingErr => {
                  if (deletingErr) throw new Error(`Error with deleting file: ${file}`);
                });
              }
            });
          } else if (stats.isDirectory()) {
            fs.access(path.join(fullFolderPath, file), err => {
              if (err) {
                fs.rm(path.join(newFolderPath, file), { recursive: true }, deletingErr => {
                  if (deletingErr) throw new Error(`Error with deleting file: ${file}`);
                });
              }
            });
          }
        });
      });
    });
  });
};

const readWriteStream = (fullFolderPath, newFolderPath) => {
  fs.readdir(fullFolderPath, (err, files) => {
    if (err) throw new Error('Error with file');

    files.forEach(file => {
      fs.stat(path.join(fullFolderPath, file), (errInfo, stats) => {
        if (errInfo) throw new Error(`Error with ${stats}`);

        if (stats.isFile()) {
          const readStream = fs.createReadStream(path.join(fullFolderPath, file));
          const writeStream = fs.createWriteStream(path.join(newFolderPath, file));
          readStream.pipe(writeStream);
        } else if (stats.isDirectory()) {
          newFolderCreator(path.join(fullFolderPath, file), path.join(newFolderPath, file));
          readWriteStream(path.join(fullFolderPath, file), path.join(newFolderPath, file));
        }
      });
    });
  });
};

const copyFiles = async () => {
  await newFolderCreator(fullFolderPath, newFolderPath);
  await readWriteStream(fullFolderPath, newFolderPath);
};
copyFiles();
