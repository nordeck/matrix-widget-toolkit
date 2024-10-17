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
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { ComponentType, PropsWithChildren, act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StoreProvider } from '../store';
import { RelationsPage } from './RelationsPage';
import {
  mockMessageCollectionEvent,
  mockReactionEvent,
  mockRoomMessageEvent,
} from './testUtils';

let widgetApi: MockedWidgetApi;
let wrapper: ComponentType<PropsWithChildren>;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  widgetApi.mockSendStateEvent({
    type: 'm.room.power_levels',
    sender: '@user-id',
    state_key: '',
    content: { users_default: 50 },
    origin_server_ts: 0,
    event_id: '$event-id',
    room_id: '!room-id',
  });

  widgetApi.mockSendRoomEvent(mockRoomMessageEvent());
  widgetApi.mockSendRoomEvent(
    mockReactionEvent({ 'm.relates_to': { key: '❄️' } }),
  );
  widgetApi.mockSendStateEvent(mockMessageCollectionEvent());

  wrapper = ({ children }: PropsWithChildren) => (
    <WidgetApiMockProvider value={widgetApi}>
      <StoreProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </StoreProvider>
    </WidgetApiMockProvider>
  );
});

describe('<RelationsPage />', () => {
  it('should render without exploding', async () => {
    render(<RelationsPage />, { wrapper });

    expect(
      screen.getByRole('link', { name: 'Back to navigation' }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: 'Event Relations' }),
    ).resolves.toBeInTheDocument();

    expect(
      screen.getByRole('textbox', { name: 'Send a message' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();

    const list = screen.getByRole('list', { name: 'Messages' });
    const listitem = await within(list).findByRole('listitem', {
      name: 'My message @user-id',
    });

    expect(within(listitem).getByText('My message')).toBeInTheDocument();
    expect(within(listitem).getByText('@user-id')).toBeInTheDocument();
    expect(
      within(listitem).getByRole('button', {
        name: 'Remove reaction "Snowflake"',
        description: 'My message @user-id',
        pressed: true,
      }),
    ).toBeInTheDocument();
    expect(
      within(listitem).getByRole('button', {
        name: 'Add reaction "Thumbs Up"',
        description: 'My message @user-id',
        pressed: false,
      }),
    ).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<RelationsPage />, { wrapper });

    expect(
      screen.getByRole('heading', { name: 'Event Relations' }),
    ).toBeInTheDocument();

    // TODO: this should not be needed to wrap in act, we should review this later
    await act(async () => {
      expect(await axe.run(container)).toHaveNoViolations();
    });
  });

  it('should send a new message', async () => {
    render(<RelationsPage />, { wrapper });

    const textfield = await screen.findByRole('textbox', {
      name: 'Send a message',
    });
    await userEvent.type(textfield, 'Hey, how are you?{enter}');

    const listbox = await screen.findByRole('listitem', {
      name: 'Hey, how are you? @user-id',
    });

    expect(textfield).toHaveValue('');

    expect(
      within(listbox).getByRole('button', {
        name: 'Add reaction "Snowflake"',
        description: 'Hey, how are you? @user-id',
        pressed: false,
      }),
    ).toBeInTheDocument();
    expect(
      within(listbox).getByRole('button', {
        name: 'Add reaction "Thumbs Up"',
        description: 'Hey, how are you? @user-id',
        pressed: false,
      }),
    ).toBeInTheDocument();
  });

  it('Should add a reaction', async () => {
    render(<RelationsPage />, { wrapper });

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Add reaction "Thumbs Up"',
        description: 'My message @user-id',
        pressed: false,
      }),
    );

    expect(
      await screen.findByRole('button', {
        name: 'Remove reaction "Thumbs Up"',
        description: 'My message @user-id',
        pressed: true,
      }),
    ).toBeInTheDocument();
  });

  it('Should remove a reaction', async () => {
    render(<RelationsPage />, { wrapper });

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Remove reaction "Snowflake"',
        description: 'My message @user-id',
        pressed: true,
      }),
    );

    expect(
      await screen.findByRole('button', {
        name: 'Add reaction "Snowflake"',
        description: 'My message @user-id',
        pressed: false,
      }),
    ).toBeInTheDocument();
  });

  it('should not be able to send a message if the permission for the state event is missing', async () => {
    widgetApi.mockSendStateEvent({
      type: 'm.room.power_levels',
      sender: '@user-id',
      state_key: '',
      content: { users_default: 0 },
      origin_server_ts: 0,
      event_id: '$event-id',
      room_id: '!room-id',
    });

    render(<RelationsPage />, { wrapper });

    await expect(
      screen.findByText("You don't have the permission to send new messages."),
    ).resolves.toBeInTheDocument();
  });

  it('should not be able to react if the permissions is missing', async () => {
    render(<RelationsPage />, { wrapper });

    const addReactionButton = await screen.findByRole('button', {
      name: 'Add reaction "Thumbs Up"',
      description: 'My message @user-id',
      pressed: false,
    });

    const removeReactionButton = await screen.findByRole('button', {
      name: 'Remove reaction "Snowflake"',
      description: 'My message @user-id',
      pressed: true,
    });

    expect(addReactionButton).toBeEnabled();
    expect(removeReactionButton).toBeEnabled();

    act(() => {
      widgetApi.mockSendStateEvent({
        type: 'm.room.power_levels',
        sender: '@user-id',
        state_key: '',
        content: { users_default: 0, events_default: 50 },
        origin_server_ts: 0,
        event_id: '$event-id',
        room_id: '!room-id',
      });
    });

    expect(addReactionButton).toBeDisabled();
    expect(removeReactionButton).toBeDisabled();
  });
});
