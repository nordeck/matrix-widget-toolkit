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
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { IdentityPage } from './IdentityPage';

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

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('<IdentityPage />', () => {
  it('should render without exploding', async () => {
    render(<IdentityPage />, { wrapper });

    expect(
      screen.getByRole('link', { name: /back to navigation/i }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: /Identity/i }),
    ).resolves.toBeInTheDocument();

    expect(await screen.findByText('Error')).toBeInTheDocument();
    expect(screen.getByText(/error: .+/i)).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<IdentityPage />, { wrapper });

    await expect(
      screen.findByRole('heading', { name: /Identity/i }),
    ).resolves.toBeInTheDocument();

    expect(await axe.run(container)).toHaveNoViolations();
  });

  it('should show the user information', async () => {
    widgetApi.requestOpenIDConnectToken.mockResolvedValue({
      matrix_server_name: 'synapse.local',
      token_type: 'Bearer',
      access_token: '<access-token>',
      expires_in: 3600,
    });

    server.use(
      http.get(
        'https://synapse.local/_matrix/federation/v1/openid/userinfo',
        ({ request }) => {
          const url = new URL(request.url);

          if (url.searchParams.get('access_token') !== '<access-token>') {
            return HttpResponse.json('Unexpected token', { status: 500 });
          }

          return HttpResponse.json({ sub: '@alice:example.com' });
        },
      ),
    );

    render(<IdentityPage />, { wrapper });

    await expect(
      screen.findByText(/identity verified/i),
    ).resolves.toBeInTheDocument();
    expect(
      screen.getByText(`{ "sub": "@alice:example.com" }`),
    ).toBeInTheDocument();
  });

  it('should show an error if the user rejected the token capability', async () => {
    widgetApi.requestOpenIDConnectToken.mockRejectedValue(
      new Error('The user rejected the request'),
    );

    render(<IdentityPage />, { wrapper });

    await expect(
      screen.findByText(/error: the user rejected the request/i),
    ).resolves.toBeInTheDocument();
  });

  it('should show an error if no home server was provided', async () => {
    widgetApi.requestOpenIDConnectToken.mockResolvedValue({});

    render(<IdentityPage />, { wrapper });

    await expect(
      screen.findByText(/error: unknown home server/i),
    ).resolves.toBeInTheDocument();
  });

  it('should show an error if the token type was unexpected', async () => {
    widgetApi.requestOpenIDConnectToken.mockResolvedValue({
      matrix_server_name: 'synapse.local',
    });

    render(<IdentityPage />, { wrapper });

    await expect(
      screen.findByText(/error: unknown token type/i),
    ).resolves.toBeInTheDocument();
  });

  it('should show an error if the home server returned an error', async () => {
    widgetApi.requestOpenIDConnectToken.mockResolvedValue({
      matrix_server_name: 'synapse.local',
      token_type: 'Bearer',
      access_token: '<access-token>',
      expires_in: 3600,
    });

    server.use(
      http.get(
        'https://synapse.local/_matrix/federation/v1/openid/userinfo',
        () => {
          return HttpResponse.json('Internal Server Error', { status: 500 });
        },
      ),
    );

    render(<IdentityPage />, { wrapper });

    await expect(
      screen.findByText(
        /error: error while retrieving identity: "Internal Server Error"/i,
      ),
    ).resolves.toBeInTheDocument();
  });
});
