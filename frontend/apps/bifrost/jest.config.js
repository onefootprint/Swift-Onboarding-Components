const base = require('config/jest-base-web');

module.exports = {
  ...base,
  setupFiles: ['<rootDir>/src/config/initializers/react-i18next-test.ts'],
};
