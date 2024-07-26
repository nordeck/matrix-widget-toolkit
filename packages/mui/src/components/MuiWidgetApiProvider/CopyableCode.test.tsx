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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useCopyToClipboard as useCopyToClipboardMocked } from 'react-use';
import { CopyableCode } from './CopyableCode';

jest.mock('react-use');

const useCopyToClipboard = jest.mocked(useCopyToClipboardMocked);

describe('<CopyableCode/>', () => {
  const copyToClipboard = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    useCopyToClipboard.mockReturnValue([
      { noUserInteraction: false },
      copyToClipboard,
    ]);
  });

  it('should render without exploding', () => {
    render(<CopyableCode code="Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy to clipboard' }),
    ).toBeInTheDocument();
  });

  it('should copy text to clipboard', async () => {
    render(<CopyableCode code="Hello World" />);

    const copyButton = screen.getByRole('button', {
      name: /copy to clipboard/i,
    });
    expect(screen.getByTestId('ContentCopyOutlinedIcon')).toBeInTheDocument();

    await userEvent.click(copyButton);

    expect(copyToClipboard).toHaveBeenCalledWith('Hello World');
    expect(screen.getByTestId('CheckOutlinedIcon')).toBeInTheDocument();

    await userEvent.tab();
    expect(screen.getByTestId('ContentCopyOutlinedIcon')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<CopyableCode code="Hello World" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
