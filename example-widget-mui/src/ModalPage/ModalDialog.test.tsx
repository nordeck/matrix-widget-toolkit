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

import { WidgetConfig } from '@matrix-widget-toolkit/api';
import { WidgetApiMockProvider } from '@matrix-widget-toolkit/react';
import { MockedWidgetApi, mockWidgetApi } from '@matrix-widget-toolkit/testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { ComponentType, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ModalDialog, ModalInputData } from './ModalDialog';

let widgetApi: MockedWidgetApi;
let wrapper: ComponentType<PropsWithChildren<{}>>;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  wrapper = ({ children }: PropsWithChildren<{}>) => (
    <WidgetApiMockProvider value={widgetApi}>
      <MemoryRouter>{children}</MemoryRouter>
    </WidgetApiMockProvider>
  );
});

describe('<ModalDialog />', () => {
  beforeEach(() => {
    widgetApi.getWidgetConfig.mockReturnValue({
      data: { title: 'A Title' },
    } as WidgetConfig<ModalInputData>);
  });

  it('should render without exploding', async () => {
    render(<ModalDialog />, { wrapper });

    await expect(screen.findByText(/a title/i)).resolves.toBeInTheDocument();
    expect(screen.getByText(/some content…/i)).toBeInTheDocument();
    expect(screen.getByText(/Room ID: !room-id/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /i am confident!/i }),
    ).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<ModalDialog />, { wrapper });

    await expect(screen.findByText(/a title/i)).resolves.toBeInTheDocument();

    expect(await axe.run(container)).toHaveNoViolations();
  });

  it('should show a warning if the component was not opened in a modal', async () => {
    widgetApi.getWidgetConfig.mockReturnValue(undefined);

    render(<ModalDialog />, { wrapper });

    await expect(
      screen.findByText(/this widget was not opened in a modal\./i),
    ).resolves.toBeInTheDocument();
  });

  it('should enable the modal buttons on startup', async () => {
    render(<ModalDialog />, { wrapper });

    await waitFor(() => {
      expect(widgetApi.setModalButtonEnabled).toHaveBeenCalledWith(
        'net.nordeck.create.poll.yes',
        true,
      );
    });

    await waitFor(() => {
      expect(widgetApi.setModalButtonEnabled).toHaveBeenCalledWith(
        'net.nordeck.create.poll.no',
        true,
      );
    });
  });

  it('should enable an additional modal button', async () => {
    render(<ModalDialog />, { wrapper });

    await userEvent.click(
      screen.getByRole('button', { name: /i am confident!/i }),
    );

    await waitFor(() => {
      expect(widgetApi.setModalButtonEnabled).toHaveBeenCalledWith(
        'net.nordeck.create.poll.yessssss',
        true,
      );
    });
  });

  it('should close the modal if the yes button was clicked', async () => {
    const subject = new Subject<string>();
    widgetApi.observeModalButtons.mockReturnValue(subject.asObservable());

    render(<ModalDialog />, { wrapper });

    subject.next('net.nordeck.create.poll.yes');

    await waitFor(() => {
      expect(widgetApi.closeModal).toHaveBeenCalledWith({ result: 'Yes!' });
    });
  });

  it('should close the modal if the yes totally button was clicked', async () => {
    const subject = new Subject<string>();
    widgetApi.observeModalButtons.mockReturnValue(subject.asObservable());

    render(<ModalDialog />, { wrapper });

    subject.next('net.nordeck.create.poll.yessssss');

    await waitFor(() => {
      expect(widgetApi.closeModal).toHaveBeenCalledWith({
        result: 'Yes Totally!',
      });
    });
  });

  it('should close the modal if the no button was clicked', async () => {
    const subject = new Subject<string>();
    widgetApi.observeModalButtons.mockReturnValue(subject.asObservable());

    render(<ModalDialog />, { wrapper });

    subject.next('net.nordeck.create.poll.no');

    await waitFor(() => {
      expect(widgetApi.closeModal).toHaveBeenCalledWith({ result: 'No!' });
    });
  });
});
