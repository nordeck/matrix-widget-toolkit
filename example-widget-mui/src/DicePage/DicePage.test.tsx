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
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DicePage } from './DicePage';

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

describe('<DicePage />', () => {
  it('should render without exploding', async () => {
    render(<DicePage />, { wrapper });

    expect(
      screen.getByRole('link', { name: /back to navigation/i }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: /dice/i }),
    ).resolves.toBeInTheDocument();
    expect(
      screen.getByText(/nobody has thrown the dice in this room yet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /throw dice/i }),
    ).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<DicePage />, { wrapper });

    await expect(
      screen.findByRole('heading', { name: /dice/i }),
    ).resolves.toBeInTheDocument();

    expect(await axe.run(container)).toHaveNoViolations();
  });

  it('should request the capabilities', async () => {
    render(<DicePage />, { wrapper });

    expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
      WidgetEventCapability.forRoomEvent(
        EventDirection.Receive,
        'net.nordeck.throw_dice',
      ),
    ]);

    const button = await screen.findByRole('button', { name: /throw dice/i });
    await userEvent.click(button);

    expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
      WidgetEventCapability.forRoomEvent(
        EventDirection.Send,
        'net.nordeck.throw_dice',
      ),
    ]);
  });

  it('should tell that no dice throws are present', async () => {
    render(<DicePage />, { wrapper });

    await expect(
      screen.findByText(/nobody has thrown the dice in this room yet/i),
    ).resolves.toBeInTheDocument();
  });

  it('should show the last dice throw', async () => {
    widgetApi.mockSendRoomEvent({
      type: 'net.nordeck.throw_dice',
      event_id: '$0',
      origin_server_ts: 0,
      room_id: '!room-id',
      sender: '@user-id',
      content: { pips: 5 },
    });
    widgetApi.mockSendRoomEvent({
      type: 'net.nordeck.throw_dice',
      event_id: '$1',
      origin_server_ts: 1,
      room_id: '!room-id',
      sender: '@user-id',
      content: { pips: 3 },
    });

    render(<DicePage />, { wrapper });

    await expect(screen.findByText('⚂')).resolves.toBeInTheDocument();
  });

  it('should throw a dice', async () => {
    render(<DicePage />, { wrapper });

    const button = await screen.findByRole('button', { name: /throw dice/i });
    await userEvent.click(button);

    await expect(
      screen.findByText(/your last throw: ./i),
    ).resolves.toBeInTheDocument();

    expect(widgetApi.sendRoomEvent).toHaveBeenCalledWith(
      'net.nordeck.throw_dice',
      {
        pips: expect.any(Number),
      },
    );
  });
});
