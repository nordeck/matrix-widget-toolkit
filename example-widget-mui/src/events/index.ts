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

export {
  STATE_EVENT_MESSAGE_COLLECTION,
  isValidMessageCollectionEvent,
} from './messageCollectionEvent';
export type { MessageCollectionEvent } from './messageCollectionEvent';
export { ROOM_EVENT_REACTION, isValidReactionEvent } from './reactionEvent';
export type { ReactionEvent } from './reactionEvent';
export {
  ROOM_EVENT_ROOM_MESSAGE,
  isValidRoomMessageEvent,
} from './roomMessageEvent';
export type { RoomMessageEvent } from './roomMessageEvent';
export { STATE_EVENT_ROOM_NAME, isValidRoomNameEvent } from './roomNameEvent';
export type { RoomNameEvent } from './roomNameEvent';
export {
  STATE_EVENT_THROW_DICE,
  isValidThrowDiceEvent,
} from './throwDiceEvent';
export type { ThrowDiceEvent } from './throwDiceEvent';
export {
  ROOM_EVENT_UPLOADED_IMAGE,
  isValidUploadedImage,
} from './uploadedImageEvent';
export type { UploadedImageEvent } from './uploadedImageEvent';
