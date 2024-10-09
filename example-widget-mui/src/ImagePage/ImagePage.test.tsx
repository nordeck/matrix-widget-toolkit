/*
 * Copyright 2024 Nordeck IT + Consulting GmbH
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
import { render, screen, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import {
  EventDirection,
  WidgetApiFromWidgetAction,
  WidgetEventCapability,
} from 'matrix-widget-api';
import { ComponentType, PropsWithChildren, act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ROOM_EVENT_UPLOADED_IMAGE } from '../events';
import { StoreProvider } from '../store';
import { ImagePage } from './ImagePage';

let widgetApi: MockedWidgetApi;
let wrapper: ComponentType<PropsWithChildren>;

afterEach(() => widgetApi.stop());

beforeEach(() => {
  widgetApi = mockWidgetApi();

  global.URL.createObjectURL = vi.fn().mockReturnValue('http://...');

  wrapper = ({ children }: PropsWithChildren) => (
    <WidgetApiMockProvider value={widgetApi}>
      <StoreProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </StoreProvider>
    </WidgetApiMockProvider>
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<ImagePage>', () => {
  it('should render without exploding', async () => {
    render(<ImagePage />, { wrapper });

    expect(
      screen.getByRole('link', { name: /back to navigation/i }),
    ).toBeInTheDocument();

    await expect(
      screen.findByRole('heading', { name: /upload file/i }),
    ).resolves.toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /select image/i }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<ImagePage />, { wrapper });

    expect(
      screen.getByRole('heading', { name: /upload file/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled();
    });

    // TODO: this should not be needed to wrap in act, we should review this later
    await act(async () => {
      expect(await axe.run(container)).toHaveNoViolations();
    });
  });

  it('should request the capabilities', async () => {
    render(<ImagePage />, { wrapper });

    expect(widgetApi.requestCapabilities).toHaveBeenCalledWith([
      WidgetEventCapability.forRoomEvent(
        EventDirection.Receive,
        ROOM_EVENT_UPLOADED_IMAGE,
      ),
      WidgetEventCapability.forRoomEvent(
        EventDirection.Send,
        ROOM_EVENT_UPLOADED_IMAGE,
      ),
      WidgetApiFromWidgetAction.MSC4039UploadFileAction,
      WidgetApiFromWidgetAction.MSC4039DownloadFileAction,
      WidgetApiFromWidgetAction.MSC4039GetMediaConfigAction,
    ]);

    await expect(
      screen.findByRole('heading', { name: /upload file/i }),
    ).resolves.toBeInTheDocument();
  });

  it('should say that no images are loaded yet', async () => {
    render(<ImagePage />, { wrapper });

    await expect(
      screen.findByText(/no images uploaded to this room yet/i),
    ).resolves.toBeInTheDocument();
  });

  it('should list the image when there is an event in the room', async () => {
    widgetApi.sendRoomEvent(ROOM_EVENT_UPLOADED_IMAGE, {
      name: 'image.png',
      size: 123,
      url: 'mxc://example.com/imageACSshaw',
    });

    render(<ImagePage />, { wrapper });

    await expect(
      screen.findByRole('img', { name: /image.png/i }),
    ).resolves.toBeInTheDocument();
  });
});
