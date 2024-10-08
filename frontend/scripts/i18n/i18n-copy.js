const fs = require('fs');
const path = require('path');

function copyFile(source, target, cb) {
  let cbCalled = false;
  const targetDir = path.dirname(target);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const rd = fs.createReadStream(source);
  rd.on('error', err => done(err));

  const wr = fs.createWriteStream(target);
  wr.on('error', err => done(err));
  wr.on('close', () => done());

  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

function getPackageSrcPath(package, locale, file) {
  return path.join(
    __dirname,
    '..',
    '..',
    'packages',
    package,
    'src',
    'config',
    'locales',
    locale,
    file,
  );
}

function getTargetPath(rest) {
  return path.join(__dirname, '..', '..', rest);
}

let languages = ['en', 'es'];
let deps = [];
let targetSrc = '';
let watchFlag = '';
let tmpArray = [];

process.argv.forEach((arg, index) => {
  if (arg === '-lng' || arg === '--language') {
    tmpArray = String(process.argv[index + 1]).split(',');
    languages =
      Array.isArray(tmpArray) && tmpArray.length
        ? tmpArray.map(x => x.trim())
        : languages;
  } else if (arg === '-dep' || arg === '--dependency') {
    deps.push(...process.argv[index + 1].split(','));
  } else if (arg === '--watch') {
    watchFlag = '--watch';
  } else if (arg === '--target') {
    targetSrc = String(process.argv[index + 1]).trim();
  }
});

deps = deps.filter(Boolean).forEach(dep => {
  languages.forEach(lang => {
    const from = getPackageSrcPath(dep, lang, `${dep}.json`);
    const to = getTargetPath(`${targetSrc}/locales/${lang}/${dep}.json`);
    if (!fs.existsSync(from)) {
      console.warn(`copy: ${from} not found`);
    } else {
      copyFile(from, to, () => {
        console.log(`copy: ${from} -> ${to}`);
      });
    }
  });
});
