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

import { WidgetApi } from '@matrix-widget-toolkit/api';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';

/** Options for {@link createStore}. */
type CreateStoreOpts = {
  /** The widget api instance. */
  widgetApi: WidgetApi;
};

/**
 * Create the react store.
 *
 * @param param0 - {@link CreateStoreOpts}
 * @returns an initialized store instance
 */
export function createStore({ widgetApi }: CreateStoreOpts) {
  const roomId = widgetApi.widgetParameters.roomId;
  const userId = widgetApi.widgetParameters.userId;

  if (!roomId || !userId) {
    throw new Error('roomId or userId empty');
  }

  const store = configureStore({
    reducer: {
      // register the extensible RTK Query API
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            // make the widgetApi available for the RTK Query endpoints
            widgetApi,
          } as ThunkExtraArgument,
        },
      }).concat(baseApi.middleware),
  });

  return store;
}

/**
 * Extra arguments that can be retrieved from the API
 */
export type ThunkExtraArgument = {
  widgetApi: WidgetApi;
};
