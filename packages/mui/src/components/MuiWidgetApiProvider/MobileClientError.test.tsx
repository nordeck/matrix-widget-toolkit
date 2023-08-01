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
import { axe } from 'jest-axe';
import { MobileClientError } from './MobileClientError';

describe('<MobileClientError/>', () => {
  it('should render without exploding', () => {
    render(<MobileClientError />);

    expect(
      screen.getByText('Mobile clients are not supported'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the widget doesn't work in mobile clients/i),
    ).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<MobileClientError />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
