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
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import { ComponentType, PropsWithChildren, act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StoreProvider } from '../store';
import { PowerLevelsPage } from './PowerLevelsPage';

let widgetApi: MockedWidgetApi;
let wrapper: ComponentType<PropsWithChildren>;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  widgetApi.mockSendStateEvent({
    type: 'm.room.power_levels',
    sender: '@user-id',
    state_key: '',
    content: {
      users: { '@user-id': 100 },
    },
    origin_server_ts: 0,
    event_id: '$event-id',
    room_id: '!room-id',
  });
  widgetApi.mockSendStateEvent({
    type: 'm.room.member',
    sender: '@user-id',
    state_key: '@another-user',
    content: { membership: 'join' },
    origin_server_ts: 0,
    event_id: '$event-id',
    room_id: '!room-id',
  });
  widgetApi.mockSendStateEvent({
    type: 'm.room.member',
    sender: '@user-id',
    state_key: '@user-id',
    content: { membership: 'join' },
    origin_server_ts: 0,
    event_id: '$event-id',
    room_id: '!room-id',
  });

  wrapper = ({ children }: PropsWithChildren) => (
    <WidgetApiMockProvider value={widgetApi}>
      <StoreProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </StoreProvider>
    </WidgetApiMockProvider>
  );
});

describe('<PowerLevelsPage />', () => {
  it('should render without exploding', async () => {
    render(<PowerLevelsPage />, { wrapper });

    expect(
      screen.getByRole('link', { name: /back to navigation/i }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: /room power levels/i }),
    ).resolves.toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Username' }),
    );

    const listbox = await screen.findByRole('listbox', { name: 'Username' });

    await userEvent.click(
      await within(listbox).findByRole('option', {
        name: '@another-user',
        selected: true,
        checked: true,
      }),
    );

    expect(screen.getByText(/state events/i)).toBeInTheDocument();
    expect(screen.getByText(/room events/i)).toBeInTheDocument();
    expect(screen.getByText(/actions/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /promote/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /demote/i })).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<PowerLevelsPage />, { wrapper });

    expect(
      await screen.findByRole('heading', { name: /room power levels/i }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole('combobox', { name: 'Username' }),
    ).toBeInTheDocument();

    // TODO: this should not be needed to wrap in act, we should review this later
    await act(async () => {
      expect(await axe.run(container)).toHaveNoViolations();
    });
  });

  it('should select another user', async () => {
    render(<PowerLevelsPage />, { wrapper });

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Username' }),
    );

    const listbox = await screen.findByRole('listbox', { name: 'Username' });

    await userEvent.click(
      within(listbox).getByRole('option', {
        name: '@user-id You',
        selected: false,
      }),
    );

    expect(
      screen.getByRole('combobox', {
        name: 'Username',
      }),
    ).toHaveTextContent('@user-id');
  });

  it('should request the capabilities', async () => {
    render(<PowerLevelsPage />, { wrapper });

    expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
      WidgetEventCapability.forStateEvent(
        EventDirection.Receive,
        'm.room.power_levels',
      ),
      WidgetEventCapability.forStateEvent(
        EventDirection.Receive,
        'm.room.member',
      ),
    ]);

    const button = await screen.findByRole('button', { name: /promote/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
        WidgetEventCapability.forStateEvent(
          EventDirection.Send,
          'm.room.power_levels',
        ),
      ]);
    });
  });

  it('should disable actions for the own user', async () => {
    render(<PowerLevelsPage />, { wrapper });

    await expect(
      screen.findByRole('heading', { name: /room power levels/i }),
    ).resolves.toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole('combobox', { name: 'Username' }),
    );

    const listbox = await screen.findByRole('listbox', { name: 'Username' });

    await userEvent.click(
      within(listbox).getByRole('option', {
        name: '@user-id You',
        selected: false,
      }),
    );

    const promoteButton = screen.getByRole('button', {
      name: /promote/i,
    });
    const demoteButton = screen.getByRole('button', { name: /demote/i });

    expect(promoteButton).toBeDisabled();
    expect(demoteButton).toBeDisabled();
  });

  it('should disable actions if the user has no power to update the power of others', async () => {
    widgetApi.mockSendStateEvent({
      type: 'm.room.power_levels',
      sender: '@user-id',
      state_key: '',
      content: {
        users: {
          '@user-id': 0,
        },
      },
      origin_server_ts: 0,
      event_id: '$event-id',
      room_id: '!room-id',
    });

    render(<PowerLevelsPage />, { wrapper });

    const promoteButton = await screen.findByRole('button', {
      name: /promote/i,
    });
    const demoteButton = screen.getByRole('button', { name: /demote/i });

    await waitFor(() => {
      expect(promoteButton).toBeDisabled();
    });

    await waitFor(() => {
      expect(demoteButton).toBeDisabled();
    });
  });

  it('should promote the user', async () => {
    render(<PowerLevelsPage />, { wrapper });

    const promoteButton = await screen.findByRole('button', {
      name: /promote/i,
    });
    const demoteButton = screen.getByRole('button', { name: /demote/i });

    expect(promoteButton).not.toBeDisabled();
    expect(demoteButton).toBeDisabled();

    await userEvent.click(promoteButton);

    await waitFor(() => {
      expect(promoteButton).toBeDisabled();
    });

    await waitFor(() => {
      expect(demoteButton).not.toBeDisabled();
    });

    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith(
      'm.room.power_levels',
      {
        users: {
          '@another-user': 50,
          '@user-id': 100,
        },
      },
    );
  });

  it('should demote the user', async () => {
    widgetApi.mockSendStateEvent({
      type: 'm.room.power_levels',
      sender: '@user-id',
      state_key: '',
      content: {
        users: {
          '@another-user': 50,
          '@user-id': 100,
        },
      },
      origin_server_ts: 0,
      event_id: '$event-id',
      room_id: '!room-id',
    });

    render(<PowerLevelsPage />, { wrapper });

    const promoteButton = await screen.findByRole('button', {
      name: /promote/i,
    });
    const demoteButton = screen.getByRole('button', { name: /demote/i });

    expect(promoteButton).toBeDisabled();
    expect(demoteButton).not.toBeDisabled();

    await userEvent.click(demoteButton);

    await waitFor(() => {
      expect(promoteButton).not.toBeDisabled();
    });

    expect(demoteButton).toBeDisabled();

    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith(
      'm.room.power_levels',
      {
        users: {
          '@another-user': 0,
          '@user-id': 100,
        },
      },
    );
  });
});
