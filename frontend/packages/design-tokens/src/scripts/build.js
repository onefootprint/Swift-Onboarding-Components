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

styleDictionary.registerTransform({
  type: `value`,
  transitive: true,
  name: `transformTypography`,
  matcher: token => token.type === 'typography',
  transformer: token => {
    const getFontWeight = fontWeight => {
      if (fontWeight === 'Bold') {
        return 600;
      }
      if (fontWeight === 'Medium') {
        return 500;
      }
      return 400;
    };

    return {
      fontFamily: token.value.fontFamily,
      fontWeight: getFontWeight(token.value.fontWeight),
      lineHeight: `${token.value.lineHeight}px`,
      fontSize: `${token.value.fontSize}px`,
    };
  },
});

const getDefaultConfig = theme => ({
  source: [`src/tokens/${theme}.json`],

  platforms: {
    web: {
      transforms: [
        'name/cti/camel',
        'transformHexToRgb',
        'transformTypography',
      ],
      buildPath: `src/output/`,
      files: [
        {
          destination: `${theme}.ts`,
          format: 'javascript/es6',
          selector: `.${theme}-theme`,
        },
      ],
    },
  },
});

['global', 'light', 'dark'].forEach(theme => {
  const config = getDefaultConfig(theme);
  styleDictionary.extend(config).buildPlatform('web');
});
