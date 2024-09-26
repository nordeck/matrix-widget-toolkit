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
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { MissingCapabilitiesError } from './MissingCapabilitiesError';

describe('<MissingCapabilitiesError>', () => {
  it('should render without exploding', () => {
    render(<MissingCapabilitiesError onRetry={vi.fn()} />);

    expect(screen.getByText('Missing capabilities')).toBeInTheDocument();
    expect(screen.getByText(/the minimum capabilities/i)).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <MissingCapabilitiesError onRetry={vi.fn()} />,
    );

    expect(await axe.run(container)).toHaveNoViolations();
  });

  it('should re-request capabilities', async () => {
    const onRetry = vi.fn();
    render(<MissingCapabilitiesError onRetry={onRetry} />);

    await userEvent.click(
      screen.getByRole('button', { name: /request capabilities/i }),
    );

    expect(onRetry).toHaveBeenCalled();
  });
});
