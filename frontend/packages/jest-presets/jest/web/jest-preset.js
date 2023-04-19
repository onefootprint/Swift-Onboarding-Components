process.env.TZ = 'UTC';

module.exports = {
  randomize: true,
  cacheDirectory: './.jest-cache',
  testRunner: 'jest-circus/runner',
  testTimeout: 45000,
  resetMocks: false,
  moduleDirectories: ['node_modules', '<rootDir>'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom', 'jest-localstorage-mock'],
  collectCoverageFrom: ['**/src/**/*.{js,ts,jsx,tsx}'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
    '^.+\\.jsx?$': 'esbuild-jest',
  },
  coveragePathIgnorePatterns: [],
  coverageThreshold: null,
  coverageReporters: ['text', 'html'],
};
