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

import { RoomEvent, StateEvent } from '@matrix-widget-toolkit/api';
import {
  MessageCollectionEvent,
  ReactionEvent,
  RoomMessageEvent,
} from '../events';

export function mockMessageCollectionEvent({
  state_key = '',
  content = {},
}: {
  state_key?: string;
  content?: Partial<MessageCollectionEvent>;
} = {}): StateEvent<MessageCollectionEvent> {
  return {
    type: 'net.nordeck.message_collection',
    sender: '@user-id',
    state_key,
    content: { eventIds: ['$message-event-id'], ...content },
    origin_server_ts: 0,
    event_id: '$collection-event-id',
    room_id: '!room-id',
  };
}

export function mockRoomMessageEvent({
  content = {},
}: {
  state_key?: string;
  content?: Partial<RoomMessageEvent>;
} = {}): RoomEvent<RoomMessageEvent> {
  return {
    type: 'm.room.message',
    sender: '@user-id',
    content: { msgtype: 'm.text', body: 'My message', ...content },
    origin_server_ts: 0,
    event_id: '$message-event-id',
    room_id: '!room-id',
  };
}

export function mockReactionEvent({
  event_id = '$event-id-0',
  'm.relates_to': content = {},
}: {
  event_id?: string;
  'm.relates_to'?: Partial<ReactionEvent['m.relates_to']>;
} = {}): RoomEvent<ReactionEvent> {
  return {
    type: 'm.reaction',
    sender: '@user-id',
    content: {
      'm.relates_to': {
        rel_type: 'm.annotation',
        event_id: '$message-event-id',
        key: 'X',
        ...content,
      },
    },
    origin_server_ts: 0,
    event_id,
    room_id: '!room-id',
  };
}
