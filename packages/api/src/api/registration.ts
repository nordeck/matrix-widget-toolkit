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
  EventDirection,
  IWidget,
  WidgetEventCapability,
} from 'matrix-widget-api';
import { extractRawWidgetParameters } from './parameters';
import { WidgetApi, WidgetParameters, WidgetRegistration } from './types';

/**
 * Checks whether all widget parameters were provided to the widget.
 *
 * @param widgetApi - The widget api to read the parameters from
 * @returns True, if all parameters were provided.
 */
export function hasRequiredWidgetParameters(widgetApi: WidgetApi): boolean {
  return (
    typeof widgetApi.widgetParameters.userId === 'string' &&
    typeof widgetApi.widgetParameters.displayName === 'string' &&
    typeof widgetApi.widgetParameters.avatarUrl === 'string' &&
    typeof widgetApi.widgetParameters.roomId === 'string' &&
    typeof widgetApi.widgetParameters.theme === 'string' &&
    typeof widgetApi.widgetParameters.clientId === 'string' &&
    typeof widgetApi.widgetParameters.clientLanguage === 'string'
  );
}

/**
 * Generate a registration URL for the widget based on the current URL and
 * include all widget parameters (and their placeholders).
 * @param options - Options for generating the URL.
 *                  Use `pathName` to include an optional sub path in the URL.
 *                  Use `includeParameters` to append the widget parameters to
 *                  the URL, defaults to `true`.
 * @returns The generated URL.
 */
export function generateWidgetRegistrationUrl(
  options: {
    pathName?: string;
    includeParameters?: boolean;
    widgetParameters?: Partial<WidgetParameters>;
  } = {}
): string {
  const { pathName, includeParameters = true, widgetParameters } = options;

  // don't forward widgetId and parentUrl as they will be generated by the client
  const { widgetId, parentUrl, ...rawWidgetParameters } =
    extractRawWidgetParameters();

  const parameters = Object.entries({
    ...rawWidgetParameters,
    theme: widgetParameters?.theme ?? '$org.matrix.msc2873.client_theme',
    matrix_user_id: widgetParameters?.userId ?? '$matrix_user_id',
    matrix_display_name:
      widgetParameters?.displayName ?? '$matrix_display_name',
    matrix_avatar_url: widgetParameters?.avatarUrl ?? '$matrix_avatar_url',
    matrix_room_id: widgetParameters?.roomId ?? '$matrix_room_id',
    matrix_client_id:
      widgetParameters?.clientId ?? '$org.matrix.msc2873.client_id',
    matrix_client_language:
      widgetParameters?.clientLanguage ?? '$org.matrix.msc2873.client_language',
  })
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const url = new URL(window.location.href);
  if (pathName) {
    url.pathname = pathName;
  } else {
    // ensure trailing '/'
    url.pathname = url.pathname.replace(/\/?$/, '/');
  }
  url.search = '';
  url.hash = includeParameters ? `#/?${parameters}` : '';
  return url.toString();
}

export const STATE_EVENT_WIDGETS = 'im.vector.modular.widgets';

/**
 * Repair/configure the registration of the current widget.
 * This steps make sure to include all the required widget parameters in the
 * URL. Support setting a widget name and additional parameters.
 *
 * @param widgetApi - The widget api of the current widget.
 * @param registration - Optional configuration options for the widget
 *                       registration, like the display name of the widget.
 */
export async function repairWidgetRegistration(
  widgetApi: WidgetApi,
  registration: WidgetRegistration = {}
): Promise<void> {
  await widgetApi.requestCapabilities([
    WidgetEventCapability.forStateEvent(
      EventDirection.Send,
      STATE_EVENT_WIDGETS,
      widgetApi.widgetId
    ),
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      STATE_EVENT_WIDGETS,
      widgetApi.widgetId
    ),
  ]);

  const readResult = await widgetApi.receiveSingleStateEvent<IWidget>(
    STATE_EVENT_WIDGETS,
    widgetApi.widgetId
  );

  if (!readResult) {
    throw new Error(
      "Error while repairing registration, can't find existing registration."
    );
  }

  const url = generateWidgetRegistrationUrl();
  const name =
    registration.name &&
    (!readResult.content.name ||
      readResult.content.name === 'Custom Widget' ||
      readResult.content.name === 'Custom')
      ? registration.name
      : readResult.content.name;
  const type =
    registration.type &&
    (!readResult.content.type || readResult.content.type === 'm.custom')
      ? registration.type
      : readResult.content.type;
  const data = registration.data
    ? { ...readResult.content.data, ...registration.data }
    : readResult.content.data;

  // This is a workaround because changing the widget config is breaking the
  // widget API communication. However we need to fail in case the power level
  // for this change is missing. As the error happens quite fast, we just wait
  // a moment and then consider the operation as succeeded.
  await Promise.race([
    widgetApi.sendStateEvent<IWidget>(
      STATE_EVENT_WIDGETS,
      {
        ...readResult.content,
        url: url.toString(),
        name,
        type,
        data,
        // TODO: Consider uploading an avatar in the future. However, this requires
        // the ability to upload an image into the channel, so we have to wait till
        // that feature is available.
        // See https://github.com/vector-im/element-web/issues/19435
      },
      { stateKey: widgetApi.widgetId }
    ),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
}