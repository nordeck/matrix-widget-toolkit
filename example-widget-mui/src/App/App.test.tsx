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

import { WidgetApiImpl } from '@matrix-widget-toolkit/api';
import { render, screen } from '@testing-library/react';
import { App } from './App';

it('should render error message', async () => {
  const widgetApiPromise = WidgetApiImpl.create();

  render(<App widgetApiPromise={widgetApiPromise} />);

  await expect(
    screen.findByText(/only runs as a widget/i)
  ).resolves.toBeInTheDocument();
});
