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

import { parse } from 'qs';
import { WidgetParameters } from './types';

/**
 * Parameters used to initialize the widget API inside the widget.
 */
export type WidgetApiParameters = {
  /**
   * The id of the widget.
   */
  widgetId: string;
  /**
   * The origin of the client.
   */
  clientOrigin: string;
};

/**
 * Extract the parameters used to initialize the widget API from the current
 * `window.location`.
 * @returns The parameters required for initializing the widget API.
 */
export function extractWidgetApiParameters(): WidgetApiParameters {
  const query = parse(window.location.search, { ignoreQueryPrefix: true }) as {
    parentUrl?: string;
    widgetId?: string;
  };

  // If either parentUrl or widgetId is missing, we have no element context and
  // want to inform the user that the widget only works inside of element.
  if (typeof query.parentUrl !== 'string') {
    throw Error('Missing parameter "parentUrl"');
  }

  const clientOrigin = new URL(query.parentUrl).origin;

  if (typeof query.widgetId !== 'string') {
    throw Error('Missing parameter "widgetId"');
  }

  const widgetId = query.widgetId;

  return { widgetId, clientOrigin };
}

/**
 * Extract the widget parameters from the current `window.location`.
 * @returns The all unprocessed raw widget parameters.
 */
export function extractRawWidgetParameters(): Record<string, string> {
  const hash = window.location.hash.substring(
    window.location.hash.indexOf('?') + 1
  );
  const params = {
    // TODO: Information are leaked to the server when transmitted via query parameters?
    // prefer to use hash instead of search
    ...parse(window.location.search, { ignoreQueryPrefix: true }),
    ...parse(hash),
  };

  return Object.fromEntries(
    Object.entries(params).filter(
      // For now only use simple values, don't allow them to be specified more
      // than once.
      (e): e is [string, string] => typeof e[1] === 'string'
    )
  );
}

/**
 * Extract the widget parameters from the current `window.location`.
 * @returns The widget parameters.
 */
export function extractWidgetParameters(): WidgetParameters {
  const params = extractRawWidgetParameters();

  // This is a hack to detect whether we are in a mobile client that supports widgets,
  // but not the widget API. Mobile clients are not passing the parameters required for
  // the widget API (like widgetId), but are passing the replaced placeholder values for
  // the widget parameters.
  const roomId = params['matrix_room_id'];
  const isOpenedByClient =
    typeof roomId === 'string' && roomId !== '$matrix_room_id';

  return {
    userId: params['matrix_user_id'],
    displayName: params['matrix_display_name'],
    avatarUrl: params['matrix_avatar_url'],
    roomId,
    theme: params['theme'],
    clientId: params['matrix_client_id'],
    clientLanguage: params['matrix_client_language'],
    isOpenedByClient,
  };
}

/**
 * Individual fields that are decoded inside a widget id.
 */
export type WidgetId = {
  /**
   * The widget id of the main widget if working with modals, or the widget id
   * of the current widget if not.
   */
  mainWidgetId: string;
  /**
   * The room id the widget is registered in.
   */
  roomId?: string;
  /**
   * The user id of the user that registered the widget.
   */
  creator?: string;
  /**
   * True, if this widget is a modal widget.
   */
  isModal: boolean;
};

/**
 * Parse a widget id into the individual fields.
 * @param widgetId - The widget id to parse.
 * @returns The individual fields encoded inside a widget id.
 */
export function parseWidgetId(widgetId: string): WidgetId {
  // TODO: Is this whole parsing still working for user widgets?
  const mainWidgetId = decodeURIComponent(widgetId).replace(/^modal_/, '');
  const roomId = mainWidgetId.indexOf('_')
    ? decodeURIComponent(mainWidgetId.split('_')[0])
    : undefined;
  const creator =
    (mainWidgetId.match(/_/g) || []).length > 1
      ? decodeURIComponent(mainWidgetId.split('_')[1])
      : undefined;
  const isModal = decodeURIComponent(widgetId).startsWith('modal_');

  return {
    mainWidgetId,
    roomId,
    creator,
    isModal,
  };
}
