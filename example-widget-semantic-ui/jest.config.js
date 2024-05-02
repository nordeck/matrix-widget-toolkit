// Create a jest config from our craco config.
const { createJestConfig } = require('@craco/craco');
const cracoConfig = require('./craco.config');

module.exports = {
  // Use the craco.config file to get the defaults.
  ...createJestConfig(cracoConfig),
  // When running from the repository root directory, we
  // have to fix the root directory to the current directory.
  rootDir: '.',
  // When running from the root directory the detection whether
  // the setup file exists is broken, so we just add it here.
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    // Allow imports from other packages in this repository.
    '@matrix-widget-toolkit/(.*)': '<rootDir>/../packages/$1/src/index.ts',
    // Allow imports of 'semantic-ui-less/semantic.less?theme=<light|dark>'.
    'semantic-ui-less/semantic.less(.+)': 'semantic-ui-less/semantic.less',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(@bundled-es-modules)/)/',
  ],
};
