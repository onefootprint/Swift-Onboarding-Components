const styleDictionary = require('style-dictionary');
const color = require('color');

styleDictionary.registerTransform({
  type: `value`,
  transitive: true,
  name: `transformHexToRgb`,
  matcher: token => token.type === 'boxShadow',
  transformer: token => {
    const { value } = token;
    const rgbaColor = color(value.color).rgb().string();
    return `${value.x}px ${value.y}px ${value.blur}px ${rgbaColor}`;
  },
});

const getDefaultConfig = theme => {
  return {
    source: [`tokens/${theme}.json`],

    platforms: {
      web: {
        transforms: ['name/cti/camel', 'transformHexToRgb'],
        buildPath: `output/`,
        files: [
          {
            destination: `${theme}.ts`,
            format: 'javascript/es6',
            selector: `.${theme}-theme`,
          },
        ],
      },
    },
  };
};

['global', 'light', 'dark'].map(function (theme) {
  const config = getDefaultConfig(theme);
  styleDictionary.extend(config).buildPlatform('web');
});
