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

import { WidgetApiMockProvider } from '@matrix-widget-toolkit/react';
import { MockedWidgetApi, mockWidgetApi } from '@matrix-widget-toolkit/testing';
import { act, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { WelcomePage } from './WelcomePage';

let widgetApi: MockedWidgetApi;
let wrapper: ComponentType<PropsWithChildren>;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  wrapper = ({ children }: PropsWithChildren) => (
    <WidgetApiMockProvider value={widgetApi}>
      <MemoryRouter>{children}</MemoryRouter>
    </WidgetApiMockProvider>
  );
});

describe('<WelcomePage />', () => {
  it('should render without exploding', async () => {
    render(<WelcomePage />, { wrapper });

    expect(
      screen.getByRole('link', { name: /back to navigation/i }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: /welcome/i }),
    ).resolves.toBeInTheDocument();

    expect(screen.getByText(/welcome .+/i)).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<WelcomePage />, { wrapper });

    await expect(
      screen.findByRole('heading', { name: /welcome/i }),
    ).resolves.toBeInTheDocument();

    await act(async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  it('should show the greeting', () => {
    render(<WelcomePage />, { wrapper });

    expect(screen.getByText(/welcome @user/i)).toBeInTheDocument();
  });
});
