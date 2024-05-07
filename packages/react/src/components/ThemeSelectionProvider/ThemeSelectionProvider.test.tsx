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
  extractWidgetApiParameters as extractWidgetApiParametersMocked,
  extractWidgetParameters as extractWidgetParametersMocked,
  parseWidgetId as parseWidgetIdMocked,
} from '@matrix-widget-toolkit/api';
import { act, render, renderHook, screen } from '@testing-library/react';
import {
  ThemeSelectionProvider,
  useThemeSelection,
} from './ThemeSelectionProvider';

jest.mock('@matrix-widget-toolkit/api');

const extractWidgetApiParameters = jest.mocked(
  extractWidgetApiParametersMocked,
);
const extractWidgetParameters = jest.mocked(extractWidgetParametersMocked);
const parseWidgetId = jest.mocked(parseWidgetIdMocked);

describe('<ThemeSelectionProvider/>', () => {
  let beforeMediaMatch: typeof window.matchMedia;

  beforeEach(() => {
    beforeMediaMatch = window.matchMedia;

    extractWidgetApiParameters.mockReturnValue({
      widgetId: 'my-id',
      clientOrigin: '',
    });
    extractWidgetParameters.mockReturnValue({
      theme: 'dark',
      isOpenedByClient: true,
    });
    parseWidgetId.mockReturnValue({ isModal: true, mainWidgetId: 'my-id' });
  });

  afterEach(() => {
    window.matchMedia = beforeMediaMatch;
  });

  it('should render without exploding', () => {
    render(
      <ThemeSelectionProvider>
        <p>children</p>
      </ThemeSelectionProvider>,
    );

    expect(screen.getByText(/children/)).toBeInTheDocument();
  });

  it('should read default theme from extractWidgetParameters', () => {
    const {
      result: { current },
    } = renderHook(() => useThemeSelection(), {
      wrapper: ThemeSelectionProvider,
    });

    expect(current).toEqual({
      theme: 'dark',
      isModal: true,
      setTheme: expect.any(Function),
    });

    expect(extractWidgetParameters).toBeCalled();
    expect(parseWidgetId).toBeCalledWith('my-id');
  });

  it('should read default theme the media-query', () => {
    // return empty to fall through to the media-query
    extractWidgetParameters.mockReturnValue({
      theme: undefined,
      isOpenedByClient: true,
    });

    window.matchMedia = jest.fn().mockReturnValue({ matches: true });

    const {
      result: { current },
    } = renderHook(() => useThemeSelection(), {
      wrapper: ThemeSelectionProvider,
    });

    expect(current).toEqual({
      theme: 'dark',
      isModal: true,
      setTheme: expect.any(Function),
    });

    expect(window.matchMedia).toBeCalledWith('(prefers-color-scheme: dark)');
  });

  it('should ignore error of extractWidgetParameters and missing matchMedia', () => {
    extractWidgetParameters.mockReturnValue({
      theme: undefined,
      isOpenedByClient: true,
    });

    const {
      result: { current },
    } = renderHook(() => useThemeSelection(), {
      wrapper: ThemeSelectionProvider,
    });

    expect(current).toEqual({
      theme: 'light',
      isModal: true,
      setTheme: expect.any(Function),
    });
  });

  it('should update theme on setTheme', () => {
    const { result } = renderHook(() => useThemeSelection(), {
      wrapper: ThemeSelectionProvider,
    });

    expect(result.current).toEqual({
      theme: 'dark',
      isModal: true,
      setTheme: expect.any(Function),
    });

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current).toEqual({
      theme: 'light',
      isModal: true,
      setTheme: expect.any(Function),
    });
  });
});
