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
  observeRedactionEvents,
  redactEvent,
  RoomEvent,
} from '@matrix-widget-toolkit/api';
import { filter } from 'rxjs';
import {
  isValidMessageCollectionEvent,
  isValidReactionEvent,
  isValidRoomMessageEvent,
  MessageCollectionEvent,
  ReactionEvent,
  ROOM_EVENT_REACTION,
  ROOM_EVENT_ROOM_MESSAGE,
  RoomMessageEvent,
  STATE_EVENT_MESSAGE_COLLECTION,
} from '../events';
import { baseApi, ThunkExtraArgument } from '../store';
import { isError } from '../utils';

/**
 * Endpoints to receive specific room messages and related reactions.
 *
 * @remarks This api extends the {@link baseApi} and should
 *          not be registered at the store.
 */
export const roomMessagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Receive the list of relevant events in the current room */
    getRelevantEvents: builder.query<string[], void>({
      // do the initial loading
      async queryFn(_, { extra }) {
        const { widgetApi } = extra as ThunkExtraArgument;

        try {
          const event = await widgetApi.receiveSingleStateEvent(
            STATE_EVENT_MESSAGE_COLLECTION,
            '',
          );

          return {
            data:
              event && isValidMessageCollectionEvent(event)
                ? event.content.eventIds
                : [],
          };
        } catch (e) {
          return {
            error: {
              name: 'LoadFailed',
              message: `Could not load events: ${
                isError(e) ? e.message : JSON.stringify(e)
              }`,
            },
          };
        }
      },

      // observe the room and apply updates to the redux store.
      // see also https://redux-toolkit.js.org/rtk-query/usage/streaming-updates#using-the-oncacheentryadded-lifecycle
      async onCacheEntryAdded(
        _,
        { cacheDataLoaded, cacheEntryRemoved, extra, updateCachedData },
      ) {
        const { widgetApi } = extra as ThunkExtraArgument;

        // wait until first data is cached
        await cacheDataLoaded;

        const subscription = widgetApi
          .observeStateEvents(STATE_EVENT_MESSAGE_COLLECTION, { stateKey: '' })
          .pipe(filter(isValidMessageCollectionEvent))
          .subscribe(async (event) => {
            updateCachedData(() => event.content.eventIds);
          });

        // wait until subscription is cancelled
        await cacheEntryRemoved;

        subscription.unsubscribe();
      },
    }),

    /** Receive details about the room message with a specific id */
    getMessage: builder.query<
      {
        event?: RoomEvent<RoomMessageEvent>;
        reactions: RoomEvent<ReactionEvent>[];
      },
      { eventId: string }
    >({
      // do the initial loading
      async queryFn({ eventId }, { extra }) {
        const { widgetApi } = extra as ThunkExtraArgument;

        let from: string | undefined = undefined;
        const reactions: RoomEvent<ReactionEvent>[] = [];

        try {
          do {
            const result = await widgetApi.readEventRelations(eventId, {
              limit: 50,
              from,
              relationType: 'm.annotation',
              eventType: 'm.reaction',
            });

            reactions.push(...result.chunk.filter(isValidReactionEvent));

            // typescript doesn't like circular types
            from = result.nextToken as string | undefined;
          } while (from !== undefined);

          return { data: { reactions } };
        } catch (e) {
          return {
            error: {
              name: 'LoadFailed',
              message: `Could not load events: ${
                isError(e) ? e.message : JSON.stringify(e)
              }`,
            },
          };
        }
      },

      // observe the room and apply updates to the redux store.
      // see also https://redux-toolkit.js.org/rtk-query/usage/streaming-updates#using-the-oncacheentryadded-lifecycle
      async onCacheEntryAdded(
        { eventId },
        { cacheDataLoaded, cacheEntryRemoved, extra, updateCachedData },
      ) {
        const { widgetApi } = extra as ThunkExtraArgument;

        // wait until first data is cached
        await cacheDataLoaded;

        const subscription = widgetApi
          .observeRoomEvents(ROOM_EVENT_REACTION)
          .pipe(filter(isValidReactionEvent))
          .subscribe(async (event) => {
            if (
              eventId === event.content['m.relates_to'].event_id &&
              event.content['m.relates_to'].rel_type === 'm.annotation'
            ) {
              updateCachedData((data) => {
                if (
                  !data.reactions.find((r) => r.event_id === event.event_id)
                ) {
                  data.reactions.push(event);
                }
              });
            }
          });

        const redactSubscription = observeRedactionEvents(widgetApi).subscribe(
          (redaction) => {
            updateCachedData((data) => {
              data.reactions = data.reactions.filter(
                (r) => r.event_id !== redaction.redacts,
              );
            });
          },
        );

        const messageSubscription = widgetApi
          .observeRoomEvents(ROOM_EVENT_ROOM_MESSAGE)
          .pipe(filter(isValidRoomMessageEvent))
          .subscribe(async (event) => {
            if (eventId === event.event_id) {
              updateCachedData((data) => {
                data.event = event;
              });
            }
          });

        // wait until subscription is cancelled
        await cacheEntryRemoved;

        subscription.unsubscribe();
        redactSubscription.unsubscribe();
        messageSubscription.unsubscribe();
      },
    }),

    /** Send a new message to the room and register it in the message collection */
    sendMessage: builder.mutation<EmptyObject, { message: string }>({
      // do the mutation
      queryFn: async ({ message }, { extra }) => {
        const { widgetApi } = extra as ThunkExtraArgument;

        try {
          const messageEvent = await widgetApi.sendRoomEvent<RoomMessageEvent>(
            ROOM_EVENT_ROOM_MESSAGE,
            {
              msgtype: 'm.text',
              body: message,
            },
          );

          const stateEvent = await widgetApi.receiveSingleStateEvent(
            STATE_EVENT_MESSAGE_COLLECTION,
            '',
          );

          if (stateEvent && isValidMessageCollectionEvent(stateEvent)) {
            await widgetApi.sendStateEvent<MessageCollectionEvent>(
              STATE_EVENT_MESSAGE_COLLECTION,
              {
                ...stateEvent.content,
                eventIds: stateEvent.content.eventIds.concat(
                  messageEvent.event_id,
                ),
              },
            );
          } else {
            await widgetApi.sendStateEvent<MessageCollectionEvent>(
              STATE_EVENT_MESSAGE_COLLECTION,
              {
                eventIds: [messageEvent.event_id],
              },
            );
          }

          return { data: {} };
        } catch (e) {
          return {
            error: {
              name: 'SendFailed',
              message: `Could not send message: ${
                isError(e) ? e.message : JSON.stringify(e)
              }`,
            },
          };
        }
      },
    }),

    /** Send a reaction to another event */
    sendReaction: builder.mutation<
      EmptyObject,
      { eventId: string; reaction: string }
    >({
      // do the mutation
      queryFn: async ({ eventId, reaction }, { extra }) => {
        const { widgetApi } = extra as ThunkExtraArgument;

        try {
          await widgetApi.sendRoomEvent<ReactionEvent>(ROOM_EVENT_REACTION, {
            'm.relates_to': {
              rel_type: 'm.annotation',
              event_id: eventId,
              key: reaction,
            },
          });

          return { data: {} };
        } catch (e) {
          return {
            error: {
              name: 'SendFailed',
              message: `Could not send annotation: ${
                isError(e) ? e.message : JSON.stringify(e)
              }`,
            },
          };
        }
      },
    }),

    /** Redact an event */
    sendRedaction: builder.mutation<EmptyObject, { eventId: string }>({
      queryFn: async ({ eventId }, { extra }) => {
        const { widgetApi } = extra as ThunkExtraArgument;

        try {
          await redactEvent(widgetApi, eventId);

          return { data: {} };
        } catch (e) {
          return {
            error: {
              name: 'SendFailed',
              message: `Could not redact event: ${
                isError(e) ? e.message : JSON.stringify(e)
              }`,
            },
          };
        }
      },
    }),

    /** Remove a message from the collection */
    dropMessageFromCollection: builder.mutation<
      EmptyObject,
      { eventId: string }
    >({
      // do the mutation
      queryFn: async ({ eventId }, { extra }) => {
        const { widgetApi } = extra as ThunkExtraArgument;

        try {
          const stateEvent = await widgetApi.receiveSingleStateEvent(
            STATE_EVENT_MESSAGE_COLLECTION,
            '',
          );

          if (
            stateEvent &&
            isValidMessageCollectionEvent(stateEvent) &&
            stateEvent.content.eventIds.includes(eventId)
          ) {
            await widgetApi.sendStateEvent<MessageCollectionEvent>(
              STATE_EVENT_MESSAGE_COLLECTION,
              {
                ...stateEvent.content,
                eventIds: stateEvent.content.eventIds.filter(
                  (id) => id !== eventId,
                ),
              },
            );
          }

          return { data: {} };
        } catch (e) {
          return {
            error: {
              name: 'SendFailed',
              message: `Could not update the collection: ${
                isError(e) ? e.message : JSON.stringify(e)
              }`,
            },
          };
        }
      },
    }),
  }),
});

// consume the store using the hooks generated by RTK Query
export const {
  useGetMessageQuery,
  useGetRelevantEventsQuery,
  useSendMessageMutation,
  useSendReactionMutation,
  useSendRedactionMutation,
  useDropMessageFromCollectionMutation,
} = roomMessagesApi;
