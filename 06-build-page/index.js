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

const checkCopyFolder = () => {
  fs.readdir(assetsBuild, (err, folders) => {
    if (err) return;

    folders.forEach(folder => {
      fs.access(path.join(assets, folder), err => {
        if (err) {
          fs.rmdir(path.join(assetsBuild, folder), deletingErr => {
            if (deletingErr) throw new Error(`Error with deleting folder: ${folder}`);
          });
        }
      });
    });
  });
};

const checkCopyFiles = () => {
  fs.readdir(assetsBuild, (err, folders) => {
    if (err) throw new Error('Error with read folders');

    folders.forEach(folder => {
      fs.readdir(path.join(assetsBuild, folder), (err, files) => {
        if (err) throw new Error('Error with reading files');

        files.forEach(file => {
          fs.access(path.join(assets, folder, file), err => {
            if (err) {
              fs.unlink(path.join(assetsBuild, folder, file), deletingErr => {
                if (deletingErr) throw new Error(`Error with deleting file: ${file}`);
              });
            }
          });
        });
      });
    });
  });
};

const copyAssetsFoldersAndFiles = () => {
  fs.readdir(path.join(__dirname, 'assets'), (err, folders) => {
    if (err) throw new Error('Can not read assets');

    folders.forEach(folder => {
      const assetsBuildFolder = path.join(pathForBuild, 'assets', folder);

      fs.mkdir(assetsBuildFolder, { recursive: true }, err => {
        if (err) throw new Error(`Folder: ${folder}, can not be created`);
      });

      const assetsReadFolder = path.join(__dirname, 'assets', folder);

      fs.readdir(assetsReadFolder, (err, files) => {
        if (err) throw new Error('Can not read files');
        files.forEach(file => {
          const readStream = fs.createReadStream(path.join(assetsReadFolder, file));
          const writeStream = fs.createWriteStream(path.join(assetsBuildFolder, file));
          readStream.pipe(writeStream);
        });
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
  const readStream = fs.createReadStream(path.join(__dirname, 'template.html'));

  readStream.on('data', chunk => {
    fs.readdir(htmlComponents, (err, files) => {
      if (err) throw new Error('Error with read components');

      files.forEach(file => {
        const fileInfo = path.parse(file);
        if (chunk.toString().includes(fileInfo.name)) {
          const componentReadStream = fs.createReadStream(path.join(htmlComponents, file));

          componentReadStream.on('data', content => {
            chunk = chunk.toString().replaceAll(`{{${fileInfo.name}}}`, content);
            fs.writeFile(path.join(pathForBuild, 'index.html'), chunk, err => {
              if (err) throw new Error('Error with write chunk');
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
  await checkCopyFolder();
  await checkCopyFiles();
  await copyAssetsFoldersAndFiles();
  await cssBuilder();
  await htmlBuilder();
};
build();
