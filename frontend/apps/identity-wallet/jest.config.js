const base = require('config/jest-base-web');

module.exports = {
  ...base,
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
};
