// Create a jest config by extending the default craco config.
const { createJestConfig } = require('@craco/craco');

module.exports = {
  // As we don't have a craco config, we pass an empty one and
  // get the defaults.
  ...createJestConfig({}),
  // When running from the repository root directory, we
  // have to fix the root directory to the current directory.
  rootDir: '.',
  // When running from the root directory the detection whether
  // the setup file exists is broken, so we just add it here.
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    // Allow imports from other packages in this repository.
    '@matrix-widget-toolkit/(.*)': '<rootDir>/../$1/src/index.ts',
  },
};
