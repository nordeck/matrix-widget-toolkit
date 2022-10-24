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

import { stringify } from 'qs';
import { WidgetApi } from '../types';

/**
 * The capability that needs to be requested in order to navigate to another room.
 */
export const WIDGET_CAPABILITY_NAVIGATE = 'org.matrix.msc2931.navigate';

/**
 * Options for the {@link navigateToRoom} function.
 */
export type NavigateToRoomOptions = {
  /**
   * Optional, array of one or more homeserver domains to discover the room.
   */
  via?: string[];
};

/**
 * Navigate the client to another matrix room.
 *
 * @remarks This requires the {@link WIDGET_CAPABILITY_NAVIGATE} capability.
 *
 * @param widgetApi - the {@link WidgetApi} instance.
 * @param roomId - the room ID.
 * @param opts - {@link NavigateToRoomOptions}
 */
export async function navigateToRoom(
  widgetApi: WidgetApi,
  roomId: string,
  opts: NavigateToRoomOptions = {}
): Promise<void> {
  const { via = [] } = opts;
  const params = stringify(
    { via },
    { addQueryPrefix: true, arrayFormat: 'repeat' }
  );
  const url = `https://matrix.to/#/${encodeURIComponent(roomId)}${params}`;
  await widgetApi.navigateTo(url);
}
