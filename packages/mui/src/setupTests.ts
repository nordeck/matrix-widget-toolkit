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

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

// Make sure to initialize i18n (see mock below)
import i18n from 'i18next';

import { cleanup } from '@testing-library/react';
import { AxeResults } from 'axe-core';
import { initReactI18next } from 'react-i18next';
import { afterEach, expect } from 'vitest';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: { en: {} },
});

// Add support for axe
expect.extend({
  toHaveNoViolations(results: AxeResults) {
    const violations = results.violations ?? [];

    return {
      pass: violations.length === 0,
      actual: violations,
      message() {
        if (violations.length === 0) {
          return '';
        }

        return `Expected no accessibility violations but received some.

${violations
  .map(
    (violation) => `[${violation.impact}] ${violation.id}
${violation.description}
${violation.helpUrl}
`,
  )
  .join('\n')}
`;
      },
    };
  },
});

afterEach(() => {
  cleanup();
});
