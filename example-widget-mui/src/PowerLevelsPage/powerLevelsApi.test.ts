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

import { MockedWidgetApi, mockWidgetApi } from '@matrix-widget-toolkit/testing';
import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createStore } from '../store';
import { powerLevelsApi } from './powerLevelsApi';

let widgetApi: MockedWidgetApi;

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
});

describe('getPowerLevels', () => {
  it('should return the power levels', async () => {
    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(powerLevelsApi.endpoints.getPowerLevels.initiate())
        .unwrap(),
    ).resolves.toEqual({ content: { users_default: 50 } });
  });

  it('should handle missing event', async () => {
    widgetApi.clearStateEvents();

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(powerLevelsApi.endpoints.getPowerLevels.initiate())
        .unwrap(),
    ).resolves.toEqual({ content: undefined });
  });

  it('should observe the power levels', async () => {
    const store = createStore({ widgetApi });

    // open the subscription
    store.dispatch(powerLevelsApi.endpoints.getPowerLevels.initiate());

    // wait for the initial load
    await waitFor(() =>
      expect(
        powerLevelsApi.endpoints.getPowerLevels.select()(store.getState()).data,
      ).toEqual({ content: { users_default: 50 } }),
    );

    widgetApi.mockSendStateEvent({
      type: 'm.room.power_levels',
      sender: '@user-id',
      state_key: '',
      content: { users_default: 0 },
      origin_server_ts: 1,
      event_id: '$event-id-1',
      room_id: '!room-id',
    });

    // wait for the change
    await waitFor(() =>
      expect(
        powerLevelsApi.endpoints.getPowerLevels.select()(store.getState()).data,
      ).toEqual({ content: { users_default: 0 } }),
    );
  });
});

describe('updatePowerLevels', () => {
  it('should update the power levels', async () => {
    const store = createStore({ widgetApi });

    await store.dispatch(
      powerLevelsApi.endpoints.updatePowerLevels.initiate({
        users_default: 100,
      }),
    );

    expect(widgetApi.sendStateEvent).toHaveBeenCalledWith(
      'm.room.power_levels',
      {
        users_default: 100,
      },
    );
  });

  it('should eagerly update the store', async () => {
    // override the original mock so the event is not forwarded to the reader
    widgetApi.sendStateEvent.mockResolvedValue({
      type: 'm.room.power_levels',
      sender: '@user-id',
      state_key: '',
      content: { events_default: 100 },
      origin_server_ts: 1,
      event_id: '$event-id-1',
      room_id: '!room-id',
    });

    const store = createStore({ widgetApi });

    // pre populate the state
    await store
      .dispatch(powerLevelsApi.endpoints.getPowerLevels.initiate())
      .unwrap();

    await expect(
      store
        .dispatch(
          powerLevelsApi.endpoints.updatePowerLevels.initiate({
            users_default: 100,
          }),
        )
        .unwrap(),
    ).resolves.toBeDefined();

    expect(
      powerLevelsApi.endpoints.getPowerLevels.select()(store.getState()).data,
    ).toEqual({ content: { users_default: 100 } });
  });

  it('should restore eager update on errors', async () => {
    // override the original mock so the event is not forwarded to the reader
    widgetApi.sendStateEvent.mockRejectedValue(new Error('an error'));

    const store = createStore({ widgetApi });

    // pre populate the state
    await store
      .dispatch(powerLevelsApi.endpoints.getPowerLevels.initiate())
      .unwrap();

    await expect(
      store
        .dispatch(
          powerLevelsApi.endpoints.updatePowerLevels.initiate({
            users_default: 100,
          }),
        )
        .unwrap(),
    ).rejects.toBeDefined();

    expect(
      powerLevelsApi.endpoints.getPowerLevels.select()(store.getState()).data,
    ).toEqual({ content: { users_default: 50 } });
  });
});
