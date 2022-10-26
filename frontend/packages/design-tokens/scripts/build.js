const styleDictionary = require('style-dictionary');

styleDictionary.registerTransform({
  name: 'sizes/px',
  type: 'value',
  matcher: function (prop) {
    console.log('prop', prop);
    return ['spacing'].includes(prop.attributes.category);
  },
  transformer: function (prop) {
    return parseFloat(prop.original.value) + 'px';
  },
});

const getDefaultConfig = theme => {
  return {
    source: [`tokens/${theme}.json`],

    platforms: {
      web: {
        transforms: ['name/cti/camel'],
        buildPath: `output/`,
        files: [
          {
            destination: `${theme}.js`,
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
