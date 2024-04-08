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

import { StateEvent } from '@matrix-widget-toolkit/api';
import { WidgetApiMockProvider } from '@matrix-widget-toolkit/react';
import { MockedWidgetApi, mockWidgetApi } from '@matrix-widget-toolkit/testing';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RoomNameEvent } from '../events';
import { AllRoomsPage } from './AllRoomsPage';

function mockRoomNameEvent({
  room_id = '!room-id',
  content = {},
}: {
  room_id?: string;
  content?: Partial<RoomNameEvent>;
}): StateEvent<RoomNameEvent> {
  return {
    type: 'm.room.name',
    sender: '@user-id',
    state_key: '',
    content: { name: 'My Room', ...content },
    origin_server_ts: 0,
    event_id: '$event-id',
    room_id,
  };
}

let widgetApi: MockedWidgetApi;
let wrapper: ComponentType<PropsWithChildren<{}>>;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  wrapper = ({ children }: PropsWithChildren<{}>) => (
    <WidgetApiMockProvider value={widgetApi}>
      <MemoryRouter>{children}</MemoryRouter>
    </WidgetApiMockProvider>
  );
});

describe('<AllRoomsPage />', () => {
  it('should render without exploding', async () => {
    render(<AllRoomsPage />, { wrapper });

    expect(
      screen.getByRole('link', { name: /back to navigation/i }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: /all rooms/i }),
    ).resolves.toBeInTheDocument();
    expect(screen.getByText(/you have no rooms/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /refresh the room information/i }),
    ).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<AllRoomsPage />, { wrapper });

    await expect(
      screen.findByRole('heading', { name: /all rooms/i }),
    ).resolves.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should request the capabilities', async () => {
    render(<AllRoomsPage />, { wrapper });

    expect(widgetApi.requestCapabilities).toBeCalledWith([
      'org.matrix.msc2762.timeline:*',
      WidgetEventCapability.forStateEvent(
        EventDirection.Receive,
        'm.room.name',
      ),
      'org.matrix.msc2931.navigate',
    ]);

    await expect(screen.findByText(/all rooms/i)).resolves.toBeInTheDocument();
  });

  it('should tell that no rooms are present', async () => {
    render(<AllRoomsPage />, { wrapper });

    await expect(
      screen.findByText(/you have no rooms./i),
    ).resolves.toBeInTheDocument();
  });

  it('should render a list of rooms', async () => {
    widgetApi.mockSendStateEvent(
      mockRoomNameEvent({ room_id: '!room-id-1', content: { name: 'Room 1' } }),
    );
    widgetApi.mockSendStateEvent(
      mockRoomNameEvent({ room_id: '!room-id-2', content: { name: 'Room 2' } }),
    );
    widgetApi.mockSendStateEvent(
      mockRoomNameEvent({ room_id: '!room-id-3', content: { name: 'Room 3' } }),
    );
    widgetApi.mockSendStateEvent(
      mockRoomNameEvent({ room_id: '!room-id-4', content: { name: 'Room 4' } }),
    );
    widgetApi.mockSendStateEvent(
      mockRoomNameEvent({ room_id: '!room-id-5', content: { name: 'Room 5' } }),
    );

    await render(<AllRoomsPage />, { wrapper });

    await expect(
      screen.findByText(/all your rooms:/i),
    ).resolves.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /room 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /room 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /room 3/i })).toBeInTheDocument();
    expect(screen.getByText(/…and 2 more\./i)).toBeInTheDocument();
  });

  it('should update the list of rooms', async () => {
    render(<AllRoomsPage />, { wrapper });

    await expect(
      screen.findByText(/you have no rooms/i),
    ).resolves.toBeInTheDocument();

    widgetApi.mockSendStateEvent(
      mockRoomNameEvent({ room_id: '!room-id-1', content: { name: 'Room 1' } }),
    );

    await userEvent.click(
      screen.getByRole('button', { name: /refresh the room information/i }),
    );

    await expect(
      screen.findByText(/all your rooms:/i),
    ).resolves.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /room 1/i })).toBeInTheDocument();
  });

  it('should navigate to the room', async () => {
    widgetApi.mockSendStateEvent(
      mockRoomNameEvent({ room_id: '!room-id-1', content: { name: 'Room 1' } }),
    );

    await render(<AllRoomsPage />, { wrapper });

    const button = await screen.findByRole('button', { name: /room 1/i });
    await userEvent.click(button);

    expect(widgetApi.navigateTo).toBeCalledWith(
      'https://matrix.to/#/!room-id-1',
    );
  });
});
