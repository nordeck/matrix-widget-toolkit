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
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { STATE_EVENT_ROOM_NAME } from './events';
import './i18n';

// Initiate the widget API on startup. The Client will initiate
// the connection with `capabilities` and we need to make sure
// that the message doesn't get lost while we are initiating React.
const widgetApiPromise = WidgetApiImpl.create({
  // Tell which capabilities should be requested at startup. One
  // can also request capabilities after the application started.
  capabilities: [
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      STATE_EVENT_ROOM_NAME
    ),
  ],
});

ReactDOM.render(
  <React.StrictMode>
    <App widgetApiPromise={widgetApiPromise} />
  </React.StrictMode>,
  document.getElementById('root')
);
