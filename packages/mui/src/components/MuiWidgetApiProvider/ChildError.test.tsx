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
import { ChildError } from './ChildError';

describe('<ChildError/>', () => {
  it('should render without exploding', () => {
    const error = new Error('Hello World');
    render(<ChildError error={error} />);

    expect(screen.getByText('Ohh no!')).toBeInTheDocument();
    expect(
      screen.getByText(/an error occured inside the widget/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Hello World/)).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const error = new Error('Hello World');
    const { container } = render(<ChildError error={error} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
