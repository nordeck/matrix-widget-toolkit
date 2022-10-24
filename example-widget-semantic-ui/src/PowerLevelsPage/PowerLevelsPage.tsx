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
  getRoomMemberDisplayName,
  hasActionPower,
  hasRoomEventPower,
  hasStateEventPower,
  PowerLevelsActions,
  STATE_EVENT_POWER_LEVELS,
  STATE_EVENT_ROOM_MEMBER,
} from '@matrix-widget-toolkit/api';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { SemanticUiCapabilitiesGuard } from '@matrix-widget-toolkit/semantic-ui';
import { first } from 'lodash';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import { ReactElement, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Container,
  Divider,
  Dropdown,
  DropdownItemProps,
  Form,
  Header,
  Icon,
  Label,
  List,
  Segment,
} from 'semantic-ui-react';
import { STATE_EVENT_ROOM_NAME } from '../events';
import { StoreProvider } from '../store';
import {
  useGetPowerLevelsQuery,
  useUpdatePowerLevelsMutation,
} from './powerLevelsApi';
import { selectAllRoomMembers, useGetRoomMembersQuery } from './roomMembersApi';

const stateEventTypes = [
  'im.vector.modular.widgets',
  'm.room.encryption',
  'm.room.guest_access',
  'm.room.history_visibility',
  'm.room.join_rules',
  'm.room.member',
  'm.room.name',
  'm.room.power_levels',
  'm.room.topic',
  'm.space.parent',
];

const roomEventTypes = ['m.reaction', 'm.room.message'];

const actions: PowerLevelsActions[] = ['ban', 'invite', 'kick', 'redact'];

/**
 * A component that shows all users in the room and their individual permissions.
 * It can also be used promote users to moderators or demote them.
 * This component uses Redux for state management.
 */
export const PowerLevelsPage = (): ReactElement => {
  return (
    <Container>
      <Button icon labelPosition="left" as={Link} to="/">
        <Icon name="arrow alternate circle left outline" />
        Back to navigation
      </Button>

      <Divider />

      <SemanticUiCapabilitiesGuard
        capabilities={[
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            STATE_EVENT_POWER_LEVELS
          ),
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            STATE_EVENT_ROOM_MEMBER
          ),
        ]}
      >
        {/* 
          The StoreProvider is located here to keep the example small. Normal
          applications would located it outside of the router to establish a
          single, global store.
          */}
        <StoreProvider>
          <PowerLevelsView />
        </StoreProvider>
      </SemanticUiCapabilitiesGuard>
    </Container>
  );
};

const PermittedIcon = ({ permitted }: { permitted: boolean }): ReactElement => {
  if (permitted) {
    return <Icon name="check circle" color="green" />;
  } else {
    return <Icon name="times circle" color="red" />;
  }
};

export const PowerLevelsView = (): ReactElement => {
  const widgetApi = useWidgetApi();

  const { data: powerLevelsEvent } = useGetPowerLevelsQuery();
  const { data: roomMembersData } = useGetRoomMembersQuery();

  const [selectedMember, setSelectedMember] = useState<string | undefined>();

  // select the first member by default
  useEffect(() => {
    setSelectedMember((selected) => {
      if (selected === undefined) {
        return first(roomMembersData?.ids)?.toString();
      }

      return selected;
    });
  }, [roomMembersData?.ids]);

  const [updatePowerLevels, { isLoading: isMutating }] =
    useUpdatePowerLevelsMutation();

  async function updatePowerLevel(userId: string, level: number) {
    try {
      await updatePowerLevels({
        ...(powerLevelsEvent?.content ?? {}),
        users: {
          ...(powerLevelsEvent?.content?.users ?? {}),
          [userId]: level,
        },
      }).unwrap();
    } catch (err) {
      console.error(err);
    }
  }

  const allMembers = roomMembersData
    ? selectAllRoomMembers(roomMembersData)
    : [];

  const memberOptions = allMembers.map<DropdownItemProps>((member) => ({
    key: member.state_key,
    value: member.state_key,
    text: (
      <>
        {getRoomMemberDisplayName(member, allMembers)}{' '}
        {member.state_key === widgetApi.widgetParameters.userId && (
          <Label content="You" size="mini" />
        )}
      </>
    ),
  }));

  // check if we (=the user of the widget) has the power to promote or
  // demote others
  const canPromoteOrDemote = hasStateEventPower(
    powerLevelsEvent?.content,
    widgetApi.widgetParameters.userId,
    STATE_EVENT_POWER_LEVELS
  );

  // we assume that users that can change the name can be promoted or demoted
  const userIsModerator = hasStateEventPower(
    powerLevelsEvent?.content,
    selectedMember,
    STATE_EVENT_ROOM_NAME
  );

  return (
    <>
      <Segment attached>
        <Header>Room Power Levels</Header>

        <Form>
          <Form.Field>
            <label>Username</label>

            <Dropdown
              id="username"
              selection
              fluid
              options={memberOptions}
              value={selectedMember}
              onChange={(_, data) => setSelectedMember(data.value?.toString())}
            />
          </Form.Field>
        </Form>

        <Header size="small">State Events</Header>
        <List>
          {stateEventTypes.map((type) => (
            <List.Item key={type}>
              <PermittedIcon
                permitted={hasStateEventPower(
                  powerLevelsEvent?.content,
                  selectedMember,
                  type
                )}
              />
              {type}
            </List.Item>
          ))}
        </List>
        <Header size="small">Room Events</Header>
        <List>
          {roomEventTypes.map((type) => (
            <List.Item key={type}>
              <PermittedIcon
                permitted={hasRoomEventPower(
                  powerLevelsEvent?.content,
                  selectedMember,
                  type
                )}
              />
              {type}
            </List.Item>
          ))}
        </List>
        <Header size="small">Actions</Header>
        <List>
          {actions.map((action) => (
            <List.Item key={action}>
              <PermittedIcon
                permitted={hasActionPower(
                  powerLevelsEvent?.content,
                  selectedMember,
                  action
                )}
              />
              {action}
            </List.Item>
          ))}
        </List>
      </Segment>

      <ButtonGroup attached="bottom">
        <Button
          disabled={
            !canPromoteOrDemote ||
            !userIsModerator ||
            selectedMember === widgetApi.widgetParameters.userId
          }
          negative
          loading={isMutating}
          onClick={() => selectedMember && updatePowerLevel(selectedMember, 0)}
        >
          Demote User
        </Button>

        <Button
          disabled={
            !canPromoteOrDemote ||
            userIsModerator ||
            selectedMember === widgetApi.widgetParameters.userId
          }
          positive
          loading={isMutating}
          onClick={() => selectedMember && updatePowerLevel(selectedMember, 50)}
        >
          Promote User
        </Button>
      </ButtonGroup>
    </>
  );
};
