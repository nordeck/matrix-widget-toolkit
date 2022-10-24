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

declare global {
  interface Window {
    __ENVIRONMENT__: string | undefined;
  }
}

const getWindowEnvironment = () => {
  let environment: { [key: string]: string | undefined } = {};

  if (typeof window.__ENVIRONMENT__ === 'string') {
    const encoded = window.__ENVIRONMENT__;
    // check if mustache placeholder hasn't been replaced for some reason.
    if (!encoded.match(/^{{.*}}$/)) {
      try {
        environment = JSON.parse(atob(encoded));
      } catch {
        console.warn(
          'window.__ENVIRONMENT__ has an unexpected format',
          encoded
        );
      }
    }
  }
  return environment;
};

const environment = getWindowEnvironment();

/**
 * Reads environment variables starting with `REACT_APP_` from a global variable
 * at runtime and falls back to `process.env` build time variables.
 *
 * @param name - The name of the environment variable, should start with
 *               `REACT_APP_`.
 */
export function getEnvironment(name: string): string | undefined;
/**
 * Reads environment variables starting with `REACT_APP_` from a global variable
 * at runtime and falls back to `process.env` build time variables.
 *
 * @param name - The name of the environment variable, should start with
 *               `REACT_APP_`.
 * @param defaultValue - The default value to return if the environment variable
 *                       is not provided.
 */
export function getEnvironment(name: string, defaultValue: string): string;

export function getEnvironment(
  name: string,
  defaultValue?: string
): string | undefined {
  const value = environment[name] || process.env[name];
  return value ?? defaultValue;
}
