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

// lazily import the file-under-test and don't have any
// additional imports.
export {};

describe('getEnvironment', () => {
  // reset process.env
  const envOrg = process.env;

  beforeEach(() => {
    process.env = { ...envOrg };
  });

  afterEach(() => {
    process.env = envOrg;

    // reset window
    delete window.__ENVIRONMENT__;
    jest.resetModules();
  });

  it('should return variable from window', async () => {
    window.__ENVIRONMENT__ = window.btoa(
      '{"REACT_APP_EXAMPLE":"example-window"}'
    );
    const { getEnvironment } = await import('./environment');
    expect(getEnvironment('REACT_APP_EXAMPLE')).toEqual('example-window');
  });

  it('should return variable from process env', async () => {
    process.env.REACT_APP_EXAMPLE = 'example-process';
    const { getEnvironment } = await import('./environment');
    expect(getEnvironment('REACT_APP_EXAMPLE')).toEqual('example-process');
  });

  it('should return missing value', async () => {
    const { getEnvironment } = await import('./environment');
    expect(getEnvironment('REACT_APP_EXAMPLE')).toBeUndefined();
  });

  it('should return default value', async () => {
    const { getEnvironment } = await import('./environment');
    expect(getEnvironment('REACT_APP_EXAMPLE', 'default')).toEqual('default');
  });

  it('should handle invalid environment (no base64)', async () => {
    window.__ENVIRONMENT__ = 'no-base64';
    const { getEnvironment } = await import('./environment');
    expect(getEnvironment('REACT_APP_EXAMPLE')).toBeUndefined();
  });

  it('should handle invalid environment (no JSON)', async () => {
    window.__ENVIRONMENT__ = window.btoa('{no-json');
    const { getEnvironment } = await import('./environment');
    expect(getEnvironment('REACT_APP_EXAMPLE')).toBeUndefined();
  });
});
