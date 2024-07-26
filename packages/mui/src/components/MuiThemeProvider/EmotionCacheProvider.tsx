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

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { PropsWithChildren } from 'react';
import { getNonce } from './nonce';

// https://mui.com/material-ui/guides/content-security-policy/

function createEmotionCache() {
  return createCache({
    key: 'widget',
    nonce: getNonce(),
    prepend: true,
  });
}

const cache = createEmotionCache();

export function EmotionCacheProvider({ children }: PropsWithChildren<unknown>) {
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
