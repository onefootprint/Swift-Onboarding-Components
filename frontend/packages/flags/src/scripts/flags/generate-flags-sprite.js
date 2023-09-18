const fs = require('fs');
const path = require('path');
const SVGSpriter = require('svg-sprite');
/** The "@onefootprint/global-constants" package does not export commonJs pattern, so it is recommended to run this file with `bun` */
const { COUNTRIES } = require('@onefootprint/global-constants'); // eslint-disable-line import/no-extraneous-dependencies

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach(file => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath); // Recursively delete subfolders and their contents
      } else {
        fs.unlinkSync(curPath); // Delete files within the folder
      }
    });

    fs.rmdirSync(folderPath); // Delete the folder itself
  }
}

function flagAdder(compiler, list) {
  list.forEach(({ value: code }) => {
    const flag = `flag-${code.toLowerCase()}.svg`;
    const flagPath = path.join(__dirname, `../../assets/flag/${flag}`);

    compiler.add(flag, null, fs.readFileSync(flagPath, 'utf-8'));
  });

  compiler.compile((error, result) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const mode of Object.values(result)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const resource of Object.values(mode)) {
        fs.mkdirSync(path.dirname(resource.path), { recursive: true });
        fs.writeFileSync(resource.path, resource.contents);
      }
    }
  });
}

/**
 * Copy raw content + template and combine into a 3rd file
 * @param {String} rawPath The SVG with symbol file path
 * @param {String} templatePath Template path
 * @param {String} outputPath The component path
 * @returns {undefined}
 */
function copySVGContentToFlagSpriteComponent(
  rawPath,
  templatePath,
  outputPath,
) {
  fs.readFile(rawPath, 'utf8', (errA, rawContent) => {
    if (errA) {
      console.error('Error reading raw content:', errA); // eslint-disable-line no-console
      return;
    }

    fs.readFile(templatePath, 'utf8', (errB, template) => {
      if (errB) {
        console.error('Error reading template:', errB); // eslint-disable-line no-console
        return;
      }

      const combinedContent = template
        .replace('{{ComponentName}}', 'FlagsSprite')
        .replace('{{rawContent}}', rawContent);

      fs.writeFile(outputPath, combinedContent, 'utf8', errC => {
        if (errC) {
          console.error('Error writing combined content:', errC); // eslint-disable-line no-console
          return;
        }
        console.log('Combined content has been saved to', outputPath); // eslint-disable-line no-console
      });
    });
  });
}

const countriesPath = path.join(__dirname, '../../countries');
const spriter = new SVGSpriter({
  dest: countriesPath,
  sprite: 'flags.svg',
  mode: { symbol: { inline: true } },
  shape: { transform: ['svgo'] },
});

// Delete previous results of `svg-sprite` content
deleteFolderRecursive(countriesPath);

// Uses `svg-sprite` modules with the current list of countries used in our platform
flagAdder(spriter, COUNTRIES);

// Creates sprite/Flags component from template and svg sprite
copySVGContentToFlagSpriteComponent(
  path.join(countriesPath, '/symbol/svg/sprite.symbol.svg'),
  path.join(__dirname, '../../sprites/Template.txt'),
  path.join(__dirname, '../../sprites/Flags.tsx'),
);

// Delete the results of `svg-sprite` content
deleteFolderRecursive(countriesPath);
