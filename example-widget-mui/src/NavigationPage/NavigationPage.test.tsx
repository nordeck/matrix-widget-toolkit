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

import { render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { NavigationPage } from './NavigationPage';

describe('<NavigationPage>', () => {
  let wrapper: ComponentType<PropsWithChildren>;

  beforeEach(() => {
    wrapper = ({ children }: PropsWithChildren) => (
      <MemoryRouter>{children}</MemoryRouter>
    );
  });

  it('should render without exploding', () => {
    render(<NavigationPage />, { wrapper });

    const list = screen.getByRole('list', { name: 'Navigation' });

    expect(
      within(list).getByRole('listitem', { name: 'Welcome' }),
    ).toHaveAccessibleDescription('Example on widget parameters');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<NavigationPage />, { wrapper });

    expect(await axe.run(container)).toHaveNoViolations();
  });
});
