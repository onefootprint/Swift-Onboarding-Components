module.exports = {
  root: true,
  extends: ['footprint'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
};
