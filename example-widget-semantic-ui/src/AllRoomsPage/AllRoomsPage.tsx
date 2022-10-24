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
  WIDGET_CAPABILITY_NAVIGATE,
} from '@matrix-widget-toolkit/api';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { SemanticUiCapabilitiesGuard } from '@matrix-widget-toolkit/semantic-ui';
import {
  EventDirection,
  Symbols,
  WidgetEventCapability,
} from 'matrix-widget-api';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAsyncRetry } from 'react-use';
import {
  Button,
  Container,
  Divider,
  Header,
  Icon,
  List,
  Message,
  Segment,
} from 'semantic-ui-react';
import { isValidRoomNameEvent, STATE_EVENT_ROOM_NAME } from '../events';

/**
 * A component that shows a list of all rooms that the user has joined and lets
 * the user switch to the other room.
 */
export const AllRoomsPage = (): ReactElement => {
  return (
    <Container>
      <Button icon labelPosition="left" as={Link} to="/">
        <Icon name="arrow alternate circle left outline" />
        Back to navigation
      </Button>

      <Divider />

      <SemanticUiCapabilitiesGuard
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
      </SemanticUiCapabilitiesGuard>
    </Container>
  );
};

export const RoomView = (): ReactElement => {
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
      <Segment attached>
        <Header>Room List</Header>
        {roomNames.length === 0 && (
          <Message info>
            You have no rooms. Click the button to refresh.
          </Message>
        )}

        {roomNames.length > 0 && (
          <>
            All your rooms:
            <List>
              {roomNames.slice(0, 3).map((room, idx) => (
                <List.Item key={idx}>
                  <Button
                    circular
                    compact
                    icon
                    onClick={() => navigateToRoom(widgetApi, room.room_id)}
                  >
                    {room.content.name}
                    <Icon name="angle right" />
                  </Button>
                </List.Item>
              ))}
              {roomNames.length > 3 && (
                <List.Item>…and {roomNames.length - 3} more.</List.Item>
              )}
            </List>
          </>
        )}
      </Segment>

      {error && <Message error content={error.message}></Message>}

      <Button onClick={loadRooms} attached="bottom" primary loading={loading}>
        Refresh the Room Information
      </Button>
    </>
  );
};
