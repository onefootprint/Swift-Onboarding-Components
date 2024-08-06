const { transform } = require('@svgr/core');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const { last, startCase } = require('lodash');
const defaultTemplate = require('./templates/default-template');
const coloredTemplate = require('./templates/colored-template');

const INPUT_SVG_PATH = path.join(__dirname, '../../assets/ico/**/*.svg');
const OUTPUT_PATH = path.join(__dirname, '../../icos');
const FIXED_COLOR_ALIAS = '-colored';

const getFileName = filePath => last(filePath.split('/'));

const getComponentName = fileName =>
  startCase(fileName.replace('.svg', '').replace(`${FIXED_COLOR_ALIAS}`, ''))
    .split(' ')
    .join('');

const createIcoComponent = async icoPath => {
  const svgSource = await fs.promises.readFile(icoPath);
  const fileName = getFileName(icoPath);
  const isColored = fileName.includes(FIXED_COLOR_ALIAS);
  const componentName = getComponentName(fileName);
  const SvgComponent = await transform(
    svgSource,
    {
      typescript: true,
      expandProps: false,
      template: isColored ? coloredTemplate : defaultTemplate,
      replaceAttrValues: !isColored && {
        '#000': '{theme.color[color]}',
        '#000000': '{theme.color[color]}',
        black: '{theme.color[color]}',
      },
      svgProps: {
        'data-testid': '{testID}',
        'aria-label': '{ariaLabel}',
        className: '{className}',
        role: 'img',
        'data-colored': isColored,
      },
      plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx', '@svgr/plugin-prettier'],
    },
    { componentName },
  );
  fs.promises.writeFile(path.join(OUTPUT_PATH, fileName.replace('.svg', '.tsx')), SvgComponent);
};

const createTypesFile = async icoNames => {
  await fs.writeFileSync(
    path.join(OUTPUT_PATH, 'index.ts'),
    `/**
    * THIS IS AN AUTO-GENERATED FILE, DO NOT EDIT MANUALLY
    */
    ${icoNames.map(icoName => `export { default as ${getComponentName(icoName)}} from "./${icoName}";\n`).join('')}
    `,
  );
};

glob(INPUT_SVG_PATH, (err, icoPaths) => {
  if (err) throw Error('Icon generation error', err);
  icoPaths.forEach(createIcoComponent);
  const svgNames = icoPaths.map(icoPath => getFileName(icoPath).replace('.svg', ''));
  createTypesFile(svgNames);
});
