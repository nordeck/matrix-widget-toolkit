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

import { MuiCapabilitiesGuard } from '@matrix-widget-toolkit/mui';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { Box, Button, Card, CardHeader } from '@mui/material';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import { ReactElement, useMemo } from 'react';
import { useObservable } from 'react-use';
import { filter, map } from 'rxjs';
import { NavigationBar } from '../NavigationPage';
import { STATE_EVENT_ROOM_NAME, isValidRoomNameEvent } from '../events';

/**
 * A component that shows the current room name and can rename it.
 */
export const RoomPage = (): ReactElement => {
  return (
    <>
      <NavigationBar title="Room Admin Tool"></NavigationBar>

      <Box m={1}>
        <MuiCapabilitiesGuard
          capabilities={[
            WidgetEventCapability.forStateEvent(
              EventDirection.Receive,
              STATE_EVENT_ROOM_NAME,
            ),
          ]}
        >
          <RoomView />
        </MuiCapabilitiesGuard>
      </Box>
    </>
  );
};

export const RoomView = (): ReactElement => {
  const widgetApi = useWidgetApi();
  const roomName$ = useMemo(
    () =>
      widgetApi.observeStateEvents(STATE_EVENT_ROOM_NAME).pipe(
        filter(isValidRoomNameEvent),
        map((r) => r?.content.name),
      ),
    [widgetApi],
  );
  const roomName = useObservable(roomName$, undefined);

  async function handleRename() {
    try {
      await widgetApi.requestCapabilities([
        WidgetEventCapability.forStateEvent(
          EventDirection.Send,
          STATE_EVENT_ROOM_NAME,
        ),
      ]);

      const readResult = await widgetApi.receiveSingleStateEvent(
        STATE_EVENT_ROOM_NAME,
      );

      if (readResult && isValidRoomNameEvent(readResult)) {
        const oldName = readResult.content.name;
        await widgetApi.sendStateEvent<{ name: string }>(
          STATE_EVENT_ROOM_NAME,
          {
            name: `${oldName}!`,
          },
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <Card elevation={0} sx={{ my: 2 }}>
        <CardHeader title={`Current room name: ${roomName}`} />
      </Card>

      <Button onClick={handleRename} variant="contained" fullWidth>
        Rename room
      </Button>
    </>
  );
};
