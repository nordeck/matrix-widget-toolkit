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

import { RoomEvent } from '@matrix-widget-toolkit/api';
import Joi from 'joi';
import { isValidEvent } from './validation';

/**
 * The event type of the reaction.
 */
export const ROOM_EVENT_REACTION = 'm.reaction';

export type ReactionEvent = {
  'm.relates_to': {
    rel_type: string;
    event_id: string;
    key: string;
  };
};

const reactionEventSchema = Joi.object<ReactionEvent, true>({
  'm.relates_to': Joi.object({
    rel_type: Joi.string().required(),
    event_id: Joi.string().required(),
    key: Joi.string().required(),
  })
    .unknown()
    .required(),
}).unknown();

/**
 * Validates that `event` has a valid structure for a
 * {@link ReactionEvent}.
 *
 * @param event - The event to validate.
 * @returns true, if the event is valid.
 */
export function isValidReactionEvent(
  event: RoomEvent<unknown>
): event is RoomEvent<ReactionEvent> {
  return isValidEvent(event, ROOM_EVENT_REACTION, reactionEventSchema);
}
