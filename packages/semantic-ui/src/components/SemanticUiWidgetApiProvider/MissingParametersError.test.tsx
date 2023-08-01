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
  generateWidgetRegistrationUrl as generateWidgetRegistrationUrlMocked,
  repairWidgetRegistration as repairWidgetRegistrationMocked,
  WidgetApi,
} from '@matrix-widget-toolkit/api';
import { WidgetApiMockProvider } from '@matrix-widget-toolkit/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { MissingParametersError } from './MissingParametersError';

jest.mock('@matrix-widget-toolkit/api');

const repairWidgetRegistration = jest.mocked(repairWidgetRegistrationMocked);
const generateWidgetRegistrationUrl = jest.mocked(
  generateWidgetRegistrationUrlMocked,
);

describe('<MissingParametersError>', () => {
  let widgetApi: jest.Mocked<WidgetApi>;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <WidgetApiMockProvider value={widgetApi}>{children}</WidgetApiMockProvider>
  );

  beforeEach(() => {
    widgetApi = {
      widgetId: 'widget-id',
      widgetParameters: { isOpenedByClient: true },
      requestCapabilities: jest.fn(),
      hasCapabilities: jest.fn(),
    } as Partial<jest.Mocked<WidgetApi>> as jest.Mocked<WidgetApi>;

    generateWidgetRegistrationUrl.mockReturnValue('/addwidget …');
  });

  it('should render message and allow automatic fix if room admin', async () => {
    repairWidgetRegistration.mockResolvedValue();

    render(
      <MissingParametersError widgetRegistration={{ name: 'New Widget' }} />,
      { wrapper },
    );

    expect(screen.getByText('Wrong widget registration')).toBeInTheDocument();
    expect(
      screen.getByText(/the widget is not registered correctly/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/\/addwidget/)).toBeInTheDocument();
    expect(
      await screen.findByText(/you can either modify the widget/i),
    ).toBeInTheDocument();

    const repairButton = screen.getByRole('button', {
      name: /repair registration/i,
    });
    expect(repairButton).toBeInTheDocument();
    await userEvent.click(repairButton);

    expect(repairWidgetRegistration).toBeCalledWith(widgetApi, {
      name: 'New Widget',
    });
    expect(
      await screen.findByText('Widget configuration complete'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/configuration completed/i),
    ).toBeInTheDocument();
  });

  it('should render message and fail on automatic fix if not room admin', async () => {
    repairWidgetRegistration.mockRejectedValue(new Error());

    render(
      <MissingParametersError widgetRegistration={{ name: 'New Widget' }} />,
      { wrapper },
    );

    const repairButton = screen.getByRole('button', {
      name: /repair registration/i,
    });
    expect(repairButton).toBeInTheDocument();
    await userEvent.click(repairButton);

    expect(repairWidgetRegistration).toBeCalledWith(widgetApi, {
      name: 'New Widget',
    });
    expect(await screen.findByText('Error')).toBeInTheDocument();
    expect(
      await screen.findByText(/insufficient permissions/i),
    ).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
    await userEvent.click(closeButton);
  });
});
