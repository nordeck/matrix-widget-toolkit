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

import { SerializedError } from '@reduxjs/toolkit';
import {
  Api,
  BaseQueryFn,
  coreModuleName,
  createApi,
  fakeBaseQuery,
  reactHooksModuleName,
} from '@reduxjs/toolkit/query/react';

/**
 * The basis API that can be extended by {@code baseApi.injectEndpoints({})}.
 *
 * The API must not provide any endpoints to avoid any bidirectional
 * dependencies with this file.
 *
 * @remarks See also https://redux-toolkit.js.org/rtk-query/usage/code-splitting
 */
export const baseApi: Api<
  BaseQueryFn<void, unknown, SerializedError>,
  EmptyObject,
  'baseApi',
  never,
  typeof coreModuleName | typeof reactHooksModuleName
> = createApi({
  reducerPath: 'baseApi',
  baseQuery: fakeBaseQuery<SerializedError>(),
  endpoints: () => ({}),
});
