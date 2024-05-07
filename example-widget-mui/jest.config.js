/*
 * Copyright 2022 Nordeck IT + Consulting GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(@bundled-es-modules)/)/',
  ],
};
