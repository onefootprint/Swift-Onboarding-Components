module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'react-native-reanimated/plugin',
        {
          globals: ['__detectDocument', '__detectFace'],
        },
      ],
      ['module:react-native-dotenv'],
      [
        'module-resolver',
        {
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@': './src',
            '@/idv': './src/domains/idv',
            '@/wallet': './src/domains/wallet',
            '@/scan': './src/domains/idv/components/scan',
          },
        },
      ],
    ],
  };
};
