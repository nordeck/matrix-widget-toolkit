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
  generateRoomTimelineCapabilities,
  navigateToRoom,
  StateEvent,
  WidgetApi,
  WIDGET_CAPABILITY_NAVIGATE,
} from '@matrix-widget-toolkit/api';
import { MuiCapabilitiesGuard } from '@matrix-widget-toolkit/mui';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  EventDirection,
  Symbols,
  WidgetEventCapability,
} from 'matrix-widget-api';
import { ReactElement, useId } from 'react';
import { useAsyncRetry } from 'react-use';
import {
  isValidRoomNameEvent,
  RoomNameEvent,
  STATE_EVENT_ROOM_NAME,
} from '../events';
import { NavigationBar } from '../NavigationPage';

/**
 * A component that shows a list of all rooms that the user has joined and lets
 * the user switch to the other room.
 */
export const AllRoomsPage = (): ReactElement => {
  return (
    <>
      <NavigationBar title="All Rooms" />

      <Box my={1}>
        <MuiCapabilitiesGuard
          capabilities={[
            ...generateRoomTimelineCapabilities(Symbols.AnyRoom),
            WidgetEventCapability.forStateEvent(
              EventDirection.Receive,
              STATE_EVENT_ROOM_NAME
            ),
            WIDGET_CAPABILITY_NAVIGATE,
          ]}
        >
          <RoomView />
        </MuiCapabilitiesGuard>
      </Box>
    </>
  );
};

export const RoomItem = ({
  widgetApi,
  room,
}: {
  widgetApi: WidgetApi;
  room: StateEvent<RoomNameEvent>;
}): ReactElement => {
  const itemId = useId();

  return (
    <ListItemButton
      aria-labelledby={itemId}
      onClick={() => navigateToRoom(widgetApi, room.room_id)}
    >
      <ListItemIcon>
        <ArrowCircleLeftIcon />
      </ListItemIcon>
      <ListItemText primary={<span id={itemId}>{room.content.name}</span>} />
    </ListItemButton>
  );
};

export const RoomView = (): ReactElement => {
  const listId = useId();
  const moreId = useId();
  const widgetApi = useWidgetApi();
  const {
    value: roomNames = [],
    loading,
    error,
    retry: loadRooms,
  } = useAsyncRetry(async () => {
    const events = await widgetApi.receiveStateEvents(STATE_EVENT_ROOM_NAME, {
      roomIds: Symbols.AnyRoom,
    });

    return events
      .filter(isValidRoomNameEvent)
      .sort((a, b) => a.content.name.localeCompare(b.content.name));
  }, [widgetApi]);

  return (
    <>
      {roomNames.length === 0 && (
        <Alert severity="info">
          <AlertTitle>You have no rooms.</AlertTitle>
          Click the button to refresh.
        </Alert>
      )}

      {roomNames.length > 0 && (
        <>
          <Box mx={1} id={listId}>
            All your rooms:
          </Box>
          <List aria-labelledby={listId}>
            {roomNames.slice(0, 3).map((room, idx) => (
              <RoomItem key={idx} room={room} widgetApi={widgetApi} />
            ))}

            {roomNames.length > 3 && (
              <ListItem aria-labelledby={moreId}>
                <ListItemText
                  primary={
                    <span id={moreId}>…and {roomNames.length - 3} more.</span>
                  }
                />
              </ListItem>
            )}
          </List>
        </>
      )}

      <Box mx={1}>
        {error && (
          <Alert severity="error" variant="outlined" sx={{ my: 1 }}>
            {error.message}
          </Alert>
        )}

        <Button
          onClick={loadRooms}
          variant="contained"
          disabled={loading}
          fullWidth
        >
          Refresh the Room Information
        </Button>
      </Box>
    </>
  );
};
