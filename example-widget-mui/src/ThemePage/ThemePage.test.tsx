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

import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemePage } from './ThemePage';

describe('<ThemePage>', () => {
  let wrapper: ComponentType<PropsWithChildren>;

  beforeEach(() => {
    wrapper = ({ children }: PropsWithChildren) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
  });

  it('should render without exploding', async () => {
    render(<ThemePage />, { wrapper });

    expect(
      screen.getByRole('link', { name: 'Back to navigation' }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: /theme/i }),
    ).resolves.toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<ThemePage />, { wrapper });

    await expect(
      screen.findByRole('heading', { name: /theme/i }),
    ).resolves.toBeInTheDocument();

    expect(await axe.run(container)).toHaveNoViolations();
  }, 15000);

  // As this page shows primarily the visual theming, so we skip exhaustive
  // testing for it.
});
