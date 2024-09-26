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
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RoomPage } from './RoomPage';

let widgetApi: MockedWidgetApi;
let wrapper: ComponentType<PropsWithChildren>;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  widgetApi.mockSendStateEvent({
    type: 'm.room.name',
    sender: '@user-id',
    state_key: '',
    content: {
      name: 'A Test Room',
    },
    origin_server_ts: 0,
    event_id: '$event-id',
    room_id: '!room-id',
  });

  wrapper = ({ children }: PropsWithChildren) => (
    <WidgetApiMockProvider value={widgetApi}>
      <MemoryRouter>{children}</MemoryRouter>
    </WidgetApiMockProvider>
  );
});

describe('<RoomPage />', () => {
  it('should render without exploding', async () => {
    render(<RoomPage />, { wrapper });

    expect(
      screen.getByRole('link', { name: /back to navigation/i }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: /room admin tool/i }),
    ).resolves.toBeInTheDocument();
    expect(screen.getByText(/current room name:/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /rename room/i }),
    ).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<RoomPage />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /room admin tool/i }),
      ).toBeInTheDocument();
    });

    expect(await axe.run(container)).toHaveNoViolations();
  });

  it('should request the capabilities', async () => {
    render(<RoomPage />, { wrapper });

    expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
      WidgetEventCapability.forStateEvent(
        EventDirection.Receive,
        'm.room.name',
      ),
    ]);

    const button = await screen.findByRole('button', { name: /rename room/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
        WidgetEventCapability.forStateEvent(EventDirection.Send, 'm.room.name'),
      ]);
    });
  });

  it('should render the current room name', async () => {
    render(<RoomPage />, { wrapper });

    await expect(
      screen.findByText(/current room name: a test room/i),
    ).resolves.toBeInTheDocument();
  });

  it('should rename the room', async () => {
    render(<RoomPage />, { wrapper });

    const button = await screen.findByRole('button', { name: /rename room/i });
    await userEvent.click(button);

    await expect(
      screen.findByText(/current room name: a test room!/i),
    ).resolves.toBeInTheDocument();

    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith('m.room.name', {
      name: 'A Test Room!',
    });
  });
});
