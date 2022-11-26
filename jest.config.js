/**
 * @description Jest configuration options. For all available options, see
 * {@link https://jestjs.io/docs/en/configuration.html}
 */
module.exports = {
  globals: {
  },
  setupFilesAfterEnv: [
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.git/',
  ],
  collectCoverageFrom: [
    '**/src/**/*.js',
  ],
  verbose: true,
};
