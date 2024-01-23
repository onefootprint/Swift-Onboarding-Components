module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
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
      ['react-native-reanimated/plugin'],
      ['react-native-worklets-core/plugin'],
    ],
  };
};
