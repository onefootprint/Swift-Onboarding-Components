module.exports = {
  extends: [
    'plugin:playwright/recommended',
    'airbnb-typescript',
    'plugin:import/typescript',
  ],
  plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  rules: {
    'react/jsx-filename-extension': [0],
  },
};
