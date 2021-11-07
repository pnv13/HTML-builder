const fs = require('fs');
const path = require('path');

const pathForBuild = path.join(__dirname, 'project-dist');
const assets = path.join(__dirname, 'assets');
const assetsBuild = path.join(pathForBuild, 'assets');
const cssComponents = path.join(__dirname, 'styles');
const htmlComponents = path.join(__dirname, 'components');

const distCreator = () => {
  fs.mkdir(pathForBuild, { recursive: true }, err => {
    if (err) throw new Error('project-dist is already created');
  });
};

const createAssets = () => {
  fs.mkdir(path.join(pathForBuild, 'assets'), { recursive: true }, err => {
    if (err) throw new Error('assets is can not be created');
  });
};

const checkAssetsFoldersAndFiles = (assets, assetsBuild) => {
  fs.mkdir(assetsBuild, { recursive: true }, err => {
    if (err) throw new Error('Folder is created');

    fs.readdir(assetsBuild, (errFiles, files) => {
      if (errFiles) throw new Error(`Error with reading files in ${assetsBuild}`);

      files.forEach(file => {
        fs.stat(path.join(assetsBuild, file), (errInfo, stats) => {
          if (errInfo) throw new Error(`Error with ${stats}`);

          if (stats.isFile()) {
            fs.access(path.join(assets, file), err => {
              if (err) {
                fs.unlink(path.join(assetsBuild, file), deletingErr => {
                  if (deletingErr) throw new Error(`Error with deleting file: ${file}`);
                });
              }
            });
          } else if (stats.isDirectory()) {
            fs.access(path.join(assets, file), err => {
              if (err) {
                fs.rm(path.join(assetsBuild, file), { recursive: true }, deletingErr => {
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

const copyAssetsFoldersAndFiles = (assets, assetsBuild) => {
  fs.readdir(assets, (err, files) => {
    if (err) throw new Error('Error with file');

    files.forEach(file => {
      fs.stat(path.join(assets, file), (errInfo, stats) => {
        if (errInfo) throw new Error(`Error with ${stats}`);

        if (stats.isFile()) {
          const readStream = fs.createReadStream(path.join(assets, file));
          const writeStream = fs.createWriteStream(path.join(assetsBuild, file));
          readStream.pipe(writeStream);
        } else if (stats.isDirectory()) {
          checkAssetsFoldersAndFiles(path.join(assets, file), path.join(assetsBuild, file));
          copyAssetsFoldersAndFiles(path.join(assets, file), path.join(assetsBuild, file));
        }
      });
    });
  });
};

const cssBuilder = () => {
  fs.readdir(cssComponents, (err, files) => {
    if (err) throw new Error('Error with build css');
    const writeStream = fs.createWriteStream(path.join(pathForBuild, 'style.css'));
    files.forEach(file => {
      const readStream = fs.createReadStream(path.join(cssComponents, file));
      readStream.pipe(writeStream);
    });
  });
};

const htmlBuilder = () => {
  fs.readFile(path.join(__dirname, 'template.html'), 'utf8', (errReading, data) => {
    if (errReading) throw new Error('Error with reading file');

    fs.readdir(htmlComponents, (err, files) => {
      if (err) throw new Error('Error with read components');

      files.forEach(file => {
        const fileInfo = path.parse(file);
        if (data.includes(fileInfo.name)) {
          fs.readFile(path.join(htmlComponents, file), 'utf8', (errComponent, dataComponent) => {
            if (errComponent) throw new Error('Error with reading component');

            data = data.replaceAll(`{{${fileInfo.name}}}`, dataComponent);
            fs.writeFile(path.join(pathForBuild, 'index.html'), data, err => {
              if (err) throw new Error('Error with write data');
            });
          });
        }
      });
    });
  });
};

const build = async () => {
  await distCreator();
  await createAssets();
  await checkAssetsFoldersAndFiles(assets, assetsBuild);
  await copyAssetsFoldersAndFiles(assets, assetsBuild);
  await cssBuilder();
  await htmlBuilder();
};
build();
