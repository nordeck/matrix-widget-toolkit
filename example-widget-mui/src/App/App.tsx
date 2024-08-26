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

import { WidgetApi } from '@matrix-widget-toolkit/api';
import {
  MuiThemeProvider,
  MuiWidgetApiProvider,
} from '@matrix-widget-toolkit/mui';
import { ReactElement, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AllRoomsPage } from '../AllRoomsPage';
import { DicePage } from '../DicePage';
import { IdentityPage } from '../IdentityPage';
import { ImagePage } from '../ImagePage';
import { InvitationsPage } from '../InvitationsPage';
import { ModalDialog, ModalPage } from '../ModalPage';
import { NavigationPage } from '../NavigationPage';
import { PowerLevelsPage } from '../PowerLevelsPage';
import { RelationsPage } from '../RelationsPage';
import { RoomPage } from '../RoomPage';
import { ThemePage } from '../ThemePage';
import { WelcomePage } from '../WelcomePage';

export function App({
  widgetApiPromise,
}: {
  widgetApiPromise: Promise<WidgetApi>;
}): ReactElement {
  return (
    <BrowserRouter>
      <MuiThemeProvider>
        {/* Fallback suspense if no higher one is registered (used for i18n) */}
        <Suspense fallback={<></>}>
          <MuiWidgetApiProvider
            widgetApiPromise={widgetApiPromise}
            widgetRegistration={{
              name: 'Example Widget',
              type: 'com.example.clock',
              data: { title: 'Learn more…' },
            }}
          >
            <Routes>
              <Route path="/" element={<NavigationPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/identity" element={<IdentityPage />} />
              <Route path="/dice" element={<DicePage />} />
              <Route path="/room" element={<RoomPage />} />
              <Route path="/allrooms" element={<AllRoomsPage />} />
              <Route path="/modal" element={<ModalPage />} />
              <Route path="/modal/dialog" element={<ModalDialog />} />
              <Route path="/powerlevels" element={<PowerLevelsPage />} />
              <Route path="/relations" element={<RelationsPage />} />
              <Route path="/invitations" element={<InvitationsPage />} />
              <Route path="/theme" element={<ThemePage />} />
              <Route path="/image" element={<ImagePage />} />
            </Routes>
          </MuiWidgetApiProvider>
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter>
  );
}
