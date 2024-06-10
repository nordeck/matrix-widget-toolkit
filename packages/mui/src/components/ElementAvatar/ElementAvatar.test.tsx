/*
 * Copyright 2023 Nordeck IT + Consulting GmbH
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
import { axe } from 'jest-axe';
import { ElementAvatar } from './ElementAvatar';

describe('<ElementAvatar>', () => {
  it('should render without exploding', async () => {
    render(
      <ElementAvatar
        userId="@user-alice"
        displayName="Alice"
        avatarUrl={'mxc://alice'}
      />,
    );

    // The "presentation" role is searched for here, as the image has an empty alt tag.
    // https://www.w3.org/TR/html-aria/#docconformance
    await expect(
      screen.findByRole('presentation', { hidden: true }),
    ).resolves.toBeInTheDocument();
  });

  it('should have not accessibility violations', async () => {
    const { container } = render(
      <ElementAvatar
        userId="@user-alice"
        displayName="Alice"
        avatarUrl={'mxc://alice'}
      />,
    );

    await expect(
      screen.findByRole('presentation', { hidden: true }),
    ).resolves.toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render avatar url', async () => {
    render(
      <ElementAvatar
        userId="@user-alice"
        displayName="Alice"
        avatarUrl={'mxc://alice'}
      />,
    );

    await expect(
      screen.findByRole('presentation', { hidden: true }),
    ).resolves.toHaveAttribute(
      'src',
      expect.stringMatching(/\/_matrix\/media\/r0\/thumbnail\/alice/i),
    );
  });

  it('should render first letter', async () => {
    render(<ElementAvatar userId="@user-alice" displayName="Alice" />);

    await expect(screen.findByText('A')).resolves.toBeInTheDocument();
  });
});
