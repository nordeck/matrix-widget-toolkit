/*
 * Copyright 2023 Nordeck IT + Consulting GmbH
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
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InvitationsPage } from './InvitationsPage';

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

describe('<InvitationsPage />', () => {
  it('should render without exploding', async () => {
    render(<InvitationsPage />, { wrapper });

    expect(
      screen.getByRole('link', { name: /back to navigation/i }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('combobox', { name: 'Users' }),
    ).resolves.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invite' })).toBeInTheDocument();

    const invitedUsersList = screen.getByRole('list', {
      name: 'Invited users (0)',
    });

    expect(within(invitedUsersList).getByRole('listitem')).toHaveTextContent(
      'Please invite a user',
    );
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<InvitationsPage />, { wrapper });

    expect(
      await screen.findByRole('heading', { name: 'Invitations' }),
    ).toBeInTheDocument();

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(await axe.run(container)).toHaveNoViolations();
  });

  it('should request the capabilities', async () => {
    render(<InvitationsPage />, { wrapper });

    expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
      'org.matrix.msc3973.user_directory_search',
    ]);

    await expect(screen.findByText('Invitations')).resolves.toBeInTheDocument();
  });

  it('should show an error message when the search failed', async () => {
    widgetApi.searchUserDirectory.mockRejectedValue(
      new Error(
        'The user_directory_search action is not supported by the client.',
      ),
    );

    render(<InvitationsPage />, { wrapper });

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent(
      'The user_directory_search action is not supported by the client.',
    );
  });

  it('should render a list of invited users', async () => {
    widgetApi.searchUserDirectory.mockImplementation(async (searchTerm) => {
      if (searchTerm === 'search') {
        return { results: [{ userId: '@user-1', displayName: 'User 1' }] };
      }

      return { results: [] };
    });

    render(<InvitationsPage />, { wrapper });

    const combobox = await screen.findByRole('combobox', { name: 'Users' });

    await userEvent.click(combobox);
    await userEvent.type(combobox, 'search');

    await userEvent.click(
      await screen.findByRole('option', { name: 'User 1' }),
    );

    const userButton = screen.getByRole('button', { name: 'User 1' });
    await userEvent.click(screen.getByRole('button', { name: 'Invite' }));
    expect(userButton).not.toBeInTheDocument();

    const list = screen.getByRole('list', { name: 'Invited users (1)' });
    expect(within(list).getByRole('listitem')).toHaveTextContent('@user-1');
  });
});
