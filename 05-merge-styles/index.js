const fs = require('fs');
const path = require('path');

const whatBundle = path.join(__dirname, 'styles');
const whereBundle = path.join(__dirname, 'project-dist');

const checkStyles = () => {
  fs.readdir(whatBundle, (err, files) => {
    if (err) throw new Error('Error with reading styles');
    const cssFiles = files.filter(file => path.extname(file) === '.css');
    readWrite(cssFiles);
  });
};

const readWrite = cssFiles => {
  const writeStream = fs.createWriteStream(path.join(whereBundle, 'bundle.css'));
  cssFiles.forEach(file => {
    const readStream = fs.createReadStream(path.join(whatBundle, file));
    readStream.pipe(writeStream);
  });
};

const bundle = async () => {
  await checkStyles();
};
bundle();
