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

import { useThemeSelection as useThemeSelectionMocked } from '@matrix-widget-toolkit/react';
import { render } from '@testing-library/react';
import { ThemeSwitcher } from './ThemeSwitcher';

jest.mock('@matrix-widget-toolkit/react');

const useThemeSelection = useThemeSelectionMocked as jest.Mock;

describe('<ThemeSwitcher/>', () => {
  it.each`
    theme      | isModal  | classNames
    ${'light'} | ${false} | ${['light']}
    ${'dark'}  | ${false} | ${['dark']}
    ${'other'} | ${false} | ${['light']}
    ${'light'} | ${true}  | ${['light', 'widgetModal']}
    ${'dark'}  | ${true}  | ${['dark', 'widgetModal']}
    ${'other'} | ${true}  | ${['light', 'widgetModal']}
  `('should handle $theme, $isModal', ({ theme, isModal, classNames }) => {
    useThemeSelection.mockReturnValue({
      theme,
      isModal,
    });

    window.document.documentElement.classList.toggle = jest.fn();

    render(<ThemeSwitcher />);

    expect(window.document.documentElement.classList.toggle).toBeCalledWith(
      'dark',
      classNames.includes('dark')
    );
    expect(window.document.documentElement.classList.toggle).toBeCalledWith(
      'light',
      classNames.includes('light')
    );
    expect(window.document.documentElement.classList.toggle).toBeCalledWith(
      'widgetModal',
      classNames.includes('widgetModal')
    );
  });
});
