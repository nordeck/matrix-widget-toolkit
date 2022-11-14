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
import { MuiCapabilitiesGuard } from '@matrix-widget-toolkit/mui';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { Button, List, ListItem } from '@mui/material';
import { sortBy } from 'lodash';
import {
  EventDirection,
  IWidgetApiRequest,
  WidgetEventCapability,
} from 'matrix-widget-api';
import { useEffect, useState } from 'react';
import { useInterval } from 'react-use';
import { NavigationBar } from '../NavigationPage';

export function DeviceMessagePage() {
  const widgetApi = useWidgetApi() as WidgetApiImpl;
  const [presentUsers, setPresentUsers] = useState<
    { time: Date; userId: string }[]
  >([]);

  async function handleSendDeviceMessage() {
    const members = await widgetApi.receiveStateEvents('m.room.member');

    await widgetApi.matrixWidgetApi.sendToDevice(
      'com.example.presents',
      false,
      Object.fromEntries(
        members.map((m) => {
          return [m.state_key, { '*': { message: 'Hello World' } }];
        })
      )
    );

    console.log('Done');
  }

  useInterval(() => {
    setPresentUsers((pus) =>
      pus.filter(({ time }) => +time + 10000 >= Date.now())
    );
  }, 1000);

  useInterval(async () => {
    const members = await widgetApi.receiveStateEvents('m.room.member');

    await widgetApi.matrixWidgetApi.sendToDevice(
      'com.example.presents',
      false,
      Object.fromEntries(
        members.map((m) => {
          return [m.state_key, { '*': {} }];
        })
      )
    );
  }, 5000);

  useEffect(() => {
    const listener = (ev: CustomEvent<IWidgetApiRequest>) => {
      const event = ev.detail.data;

      if (event.type === 'com.example.presents') {
        setPresentUsers((pus) => [
          ...pus.filter((pu) => pu.userId !== event.sender),
          { time: new Date(), userId: event.sender as string },
        ]);
      }

      console.log('\\Received', event);

      ev.preventDefault();
      widgetApi.matrixWidgetApi.transport.reply(ev.detail, {});
    };

    widgetApi.matrixWidgetApi.on('action:send_to_device', listener);

    return () => {
      widgetApi.matrixWidgetApi.off('action:send_to_device', listener);
    };
  });

  return (
    <>
      <NavigationBar title="Event Relations" />

      <MuiCapabilitiesGuard
        capabilities={[
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            'm.room.member'
          ),
          WidgetEventCapability.forToDeviceEvent(
            EventDirection.Send,
            'com.example.presents'
          ),
          WidgetEventCapability.forToDeviceEvent(
            EventDirection.Receive,
            'com.example.presents'
          ),
          WidgetEventCapability.forToDeviceEvent(
            EventDirection.Receive,
            'm.presence'
          ),
        ]}
      >
        <Button variant="outlined" onClick={handleSendDeviceMessage}>
          Send
        </Button>

        <List dense>
          {sortBy(presentUsers, 'userId').map((pu) => (
            <ListItem key={pu.userId}>{pu.userId}</ListItem>
          ))}
        </List>
      </MuiCapabilitiesGuard>
    </>
  );
}
