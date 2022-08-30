const { transform } = require('@svgr/core');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const { last, startCase } = require('lodash');
const template = require('./template');

const INPUT_SVG_PATH = path.join(__dirname, '../../assets/flag/**.svg');
const OUTPUT_PATH = path.join(__dirname, '../../flags');

const getFileName = filePath => last(filePath.split('/'));

const getComponentName = fileName =>
  startCase(fileName.replace('.svg', '')).split(' ').join('');

const createIcoComponent = async icoPath => {
  const svgSource = await fs.promises.readFile(icoPath);
  const fileName = getFileName(icoPath);
  const componentName = getComponentName(fileName);
  const SvgComponent = await transform(
    svgSource,
    {
      typescript: true,
      expandProps: false,
      template,
      replaceAttrValues: { '#0E1438': '{theme.color[color]}' },
      svgProps: {
        'data-testid': '{testID}',
        className: '{className}',
        'aria-hidden': 'true',
      },
      plugins: [
        '@svgr/plugin-svgo',
        '@svgr/plugin-jsx',
        '@svgr/plugin-prettier',
      ],
    },
    { componentName },
  );
  fs.promises.writeFile(
    path.join(OUTPUT_PATH, fileName.replace('.svg', '.tsx')),
    SvgComponent,
  );
};

const createTypesFile = async icoNames => {
  await fs.writeFileSync(
    path.join(OUTPUT_PATH, 'index.ts'),
    `/**
      * THIS IS AN AUTO-GENERATED FILE, DO NOT EDIT MANUALLY
      */
      ${icoNames
        .map(
          icoName =>
            `export { default as ${getComponentName(
              icoName,
            )}} from "./${icoName}";\n`,
        )
        .join('')}
    `,
  );
};

glob(INPUT_SVG_PATH, (err, icoPaths) => {
  if (err) throw Error('Flags generation error', err);
  icoPaths.forEach(createIcoComponent);
  const svgNames = icoPaths.map(icoPath =>
    getFileName(icoPath).replace('.svg', ''),
  );
  createTypesFile(svgNames);
});
