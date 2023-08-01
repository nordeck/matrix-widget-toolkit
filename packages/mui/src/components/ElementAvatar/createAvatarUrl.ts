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

import { getEnvironment } from '../MuiThemeProvider';

export function createAvatarUrl(
  url: string,
  { size = 60 }: { size?: number } = {},
): string {
  const mxcPrefix = 'mxc://';

  if (url.indexOf(mxcPrefix) !== 0) {
    return url;
  }

  const mxcUrl = url.slice(mxcPrefix.length);

  // TODO: Instead of retrieving the home server from an env variable, it would
  // be good to get this passed by the widget host, e.g. as an URL parameter.
  // In general our tight CSP makes it difficult to load images from this
  // source.
  // We could already access the home server URL by using the domain part of the
  // current users id and resolving the home server URL from the well-known
  // endpoint. However, this would also require a broad connect-src in the CSP.
  const homeServer = getEnvironment(
    'REACT_APP_HOME_SERVER_URL',
    'https://matrix-client.matrix.org',
  );
  const imageUrl = new URL(
    `/_matrix/media/r0/thumbnail/${mxcUrl}?width=${size}&height=${size}&method=crop`,
    homeServer,
  );
  return imageUrl.toString();
}
