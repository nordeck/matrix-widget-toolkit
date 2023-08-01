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

import { expect, test } from '@playwright/test';

test.describe('widget-server', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('should have title', async ({ page }) => {
    await expect(page).toHaveTitle(/welcome to the widget toolkit/i);
  });

  test('should have history API fallback', async ({ page }) => {
    await page.goto('/test');
    await expect(page).toHaveTitle(/welcome to the widget toolkit/i);
  });

  test('should show environment', async ({ page }) => {
    await expect(page.locator('#environment')).toHaveText(
      '{"REACT_APP_EXAMPLE":"example"}',
    );
  });

  test('should include webpack nonce', async ({ page }) => {
    await expect(page.locator('#webpack')).toHaveText(/nonce is working!/i);
  });

  test('should have X-Content-Type-Options header set', async ({ request }) => {
    const response = await request.get('');

    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('should have CSP header set', async ({ request }) => {
    const response = await request.get('');

    expect(response.headers()['content-security-policy']).toBeDefined();
  });
});
