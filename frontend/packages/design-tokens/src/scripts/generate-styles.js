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
    return `${value.x}px ${value.y}px ${value.blur}px ${value.spread}px ${rgbaColor}`;
  },
});

styleDictionary.registerTransform({
  type: `value`,
  transitive: true,
  name: `transformToPixels`,
  matcher: token =>
    token.type === 'spacing' ||
    token.type === 'sizing' ||
    token.type === 'borderRadius' ||
    token.type === 'borderWidth',
  transformer: token => {
    const { value } = token;
    return `${value}px`;
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

    return `${getFontWeight(token.value.fontWeight)} ${
      token.value.fontSize
    }px/${token.value.lineHeight}px "${token.value.fontFamily}"`;
  },
});

['light'].forEach(theme => {
  const config = {
    source: [`src/tokens/${theme}.json`],
    platforms: {
      web: {
        prefix: 'fp',
        transforms: [
          'name/cti/kebab',
          'transformHexToRgb',
          'transformTypography',
          'transformToPixels',
        ],
        buildPath: `src/output/`,
        files: [
          {
            destination: `${theme}.css`,
            format: 'css/variables',
            selector: `.${theme}-theme`,
          },
        ],
      },
    },
  };
  styleDictionary.extend(config).buildPlatform('web');
});
