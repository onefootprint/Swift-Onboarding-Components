module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'react-native-reanimated/plugin',
        {
          globals: ['__documentProcessor'],
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
            '@/app-clip': './src/domains/app-clip',
            '@/wallet': './src/domains/wallet',
            '@/scan': './src/domains/app-clip/components/scan',
          },
        },
      ],
    ],
  };
};
