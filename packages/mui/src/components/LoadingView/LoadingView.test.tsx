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
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { LoadingView } from './LoadingView';

describe('<LoadingView/>', () => {
  it('should display a loading animation if displayed long enough', async () => {
    render(<LoadingView />);

    expect(await screen.findByText('Loading…')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<LoadingView />);

    expect(await screen.findByText('Loading…')).toBeInTheDocument();
    expect(await axe.run(container)).toHaveNoViolations();
  });

  it('should not render a loading animation before a certain time is over', () => {
    render(<LoadingView />);

    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });
});
