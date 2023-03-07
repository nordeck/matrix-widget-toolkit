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
import { createAvatarUrl } from './createAvatarUrl';

jest.mock('../MuiThemeProvider', () => ({
  ...jest.requireActual('../MuiThemeProvider'),
  getEnvironment: jest.fn(),
}));

describe('createAvatarUrl', () => {
  it('should generate avatar URL from non mxc: URL', () => {
    jest
      .mocked(getEnvironment)
      .mockImplementation((_name, defaultValue) => defaultValue);

    expect(
      createAvatarUrl(
        'https://matrix-client.matrix.org/_matrix/media/r0/thumbnail/matrix.org/KbhRFOIJekHQpMVIZGpuNxBG?width=60&height=60&method=crop'
      )
    ).toBe(
      'https://matrix-client.matrix.org/_matrix/media/r0/thumbnail/matrix.org/KbhRFOIJekHQpMVIZGpuNxBG?width=60&height=60&method=crop'
    );
  });

  it('should generate avatar URL using default home server', () => {
    jest
      .mocked(getEnvironment)
      .mockImplementation((_name, defaultValue) => defaultValue);

    expect(createAvatarUrl('mxc://matrix.org/KbhRFOIJekHQpMVIZGpuNxBG')).toBe(
      'https://matrix-client.matrix.org/_matrix/media/r0/thumbnail/matrix.org/KbhRFOIJekHQpMVIZGpuNxBG?width=60&height=60&method=crop'
    );
  });

  it('should generate avatar URL using custom home server', () => {
    jest
      .mocked(getEnvironment)
      .mockImplementation((name, defaultValue) =>
        name === 'REACT_APP_HOME_SERVER_URL'
          ? 'https://example.com'
          : defaultValue
      );

    expect(createAvatarUrl('mxc://matrix.org/KbhRFOIJekHQpMVIZGpuNxBG')).toBe(
      'https://example.com/_matrix/media/r0/thumbnail/matrix.org/KbhRFOIJekHQpMVIZGpuNxBG?width=60&height=60&method=crop'
    );
  });
});
