module.exports = {
  extends: [
    './node_modules/eslint-config-airbnb-base/rules/best-practices',
    './node_modules/eslint-config-airbnb-base/rules/errors',
    './node_modules/eslint-config-airbnb-base/rules/node',
    './node_modules/eslint-config-airbnb-base/rules/style',
    './node_modules/eslint-config-airbnb-base/rules/variables',
    './node_modules/eslint-config-airbnb-base/rules/es6',
    './node_modules/eslint-config-airbnb-base/rules/strict',
  ].map(require.resolve),

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
  },
  globals: {
  },
  ignorePatterns: [
  ],
  rules: {
    'default-case': 0, // Standard pattern.
    'function-paren-newline': 0,
    'no-plusplus': 0,
    // Remove unless we introduce prettier.
    'max-len': 0,
  },
  overrides: [],
};
