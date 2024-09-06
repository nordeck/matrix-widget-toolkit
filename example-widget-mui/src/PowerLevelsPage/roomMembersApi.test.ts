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

import {
  RoomMemberStateEventContent,
  StateEvent,
} from '@matrix-widget-toolkit/api';
import { MockedWidgetApi, mockWidgetApi } from '@matrix-widget-toolkit/testing';
import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createStore } from '../store';
import { roomMembersApi } from './roomMembersApi';

function mockRoomMemberEvent({
  state_key = '@user-id',
  content = {},
}: {
  state_key?: string;
  content?: Partial<RoomMemberStateEventContent>;
}): StateEvent<RoomMemberStateEventContent> {
  return {
    type: 'm.room.member',
    sender: '@user-id',
    state_key,
    content: { membership: 'join', ...content },
    origin_server_ts: 0,
    event_id: '$event-id',
    room_id: '!room-id',
  };
}

let user1: StateEvent<RoomMemberStateEventContent>;
let user2: StateEvent<RoomMemberStateEventContent>;

let widgetApi: MockedWidgetApi;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  user1 = widgetApi.mockSendStateEvent(
    mockRoomMemberEvent({
      state_key: '@user-1',
      content: { membership: 'join' },
    }),
  );
  user2 = widgetApi.mockSendStateEvent(
    mockRoomMemberEvent({
      state_key: '@user-2',
      content: { membership: 'invite' },
    }),
  );
});

describe('getRoomMembers', () => {
  it('should return the room members', async () => {
    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(roomMembersApi.endpoints.getRoomMembers.initiate())
        .unwrap(),
    ).resolves.toEqual({
      entities: {
        [user1.state_key]: user1,
        [user2.state_key]: user2,
      },
      ids: [user1.state_key, user2.state_key],
    });
  });

  it('should handle missing event', async () => {
    widgetApi.clearStateEvents();

    const store = createStore({ widgetApi });

    await expect(
      store
        .dispatch(roomMembersApi.endpoints.getRoomMembers.initiate())
        .unwrap(),
    ).resolves.toEqual({ entities: {}, ids: [] });
  });

  it('should observe the power levels', async () => {
    const store = createStore({ widgetApi });

    // open the subscription
    store.dispatch(roomMembersApi.endpoints.getRoomMembers.initiate());

    // wait for the initial load
    await waitFor(() =>
      expect(
        roomMembersApi.endpoints.getRoomMembers.select()(store.getState()).data,
      ).toEqual({
        entities: {
          [user1.state_key]: user1,
          [user2.state_key]: user2,
        },
        ids: [user1.state_key, user2.state_key],
      }),
    );

    const userNew = widgetApi.mockSendStateEvent(
      mockRoomMemberEvent({ state_key: '@user-new' }),
    );

    // wait for the change
    await waitFor(() =>
      expect(
        roomMembersApi.endpoints.getRoomMembers.select()(store.getState()).data,
      ).toEqual({
        entities: {
          [user1.state_key]: user1,
          [user2.state_key]: user2,
          [userNew.state_key]: userNew,
        },
        ids: [user1.state_key, user2.state_key, userNew.state_key],
      }),
    );
  });
});
