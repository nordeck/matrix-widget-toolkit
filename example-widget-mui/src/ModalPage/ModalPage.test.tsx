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

import { WidgetApiMockProvider } from '@matrix-widget-toolkit/react';
import { MockedWidgetApi, mockWidgetApi } from '@matrix-widget-toolkit/testing';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ModalResult } from './ModalDialog';
import { ModalPage } from './ModalPage';

let widgetApi: MockedWidgetApi;
let wrapper: ComponentType<PropsWithChildren>;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  wrapper = ({ children }: PropsWithChildren) => (
    <WidgetApiMockProvider value={widgetApi}>
      <MemoryRouter>{children}</MemoryRouter>
    </WidgetApiMockProvider>
  );
});

describe('<ModalPage />', () => {
  it('should render without exploding', async () => {
    render(<ModalPage />, { wrapper });

    expect(
      screen.getByRole('link', { name: /back to navigation/i }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: /example for modals/i }),
    ).resolves.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /open modal/i }),
    ).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<ModalPage />, { wrapper });

    await expect(
      screen.findByRole('heading', { name: /example for modals/i }),
    ).resolves.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('should open the modal and display the no answer result', async () => {
    render(<ModalPage />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /open modal/i }));

    await expect(
      screen.findByText(/no answer :-\(/i),
    ).resolves.toBeInTheDocument();

    expect(widgetApi.openModal).toHaveBeenCalledWith(
      '/modal/dialog',
      'How do you feel?',
      {
        buttons: [
          {
            disabled: true,
            id: 'net.nordeck.create.poll.yes',
            kind: 'm.primary',
            label: 'Yes!',
          },
          {
            disabled: true,
            id: 'net.nordeck.create.poll.yessssss',
            kind: 'm.danger',
            label: 'Totally Yes!',
          },
          {
            disabled: true,
            id: 'net.nordeck.create.poll.no',
            kind: 'm.secondary',
            label: 'No!',
          },
        ],
        data: {
          title: 'This is a custom title!',
        },
      },
    );
  });

  it('should open the modal and display the result message', async () => {
    widgetApi.openModal.mockResolvedValue({
      result: 'Yes!!!!!',
    } as ModalResult);

    render(<ModalPage />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /open modal/i }));

    await expect(screen.findByText(/yes!!!!!/i)).resolves.toBeInTheDocument();
  });
});
