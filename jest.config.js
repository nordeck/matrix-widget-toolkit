/*
 * This is the root jest config that includes all sub projects to allow
 * running jest from the root directory.
 */
module.exports = {
  // Container tests are explicity not included, as they can not be run
  // without manually starting a docker container.
  projects: [
    '<rootDir>/example-widget-semantic-ui',
    '<rootDir>/example-widget-mui',
    '<rootDir>/packages/*',
  ],
};
