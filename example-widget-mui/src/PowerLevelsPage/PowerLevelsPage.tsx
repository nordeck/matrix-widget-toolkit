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
import { MuiCapabilitiesGuard } from '@matrix-widget-toolkit/mui';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
} from '@mui/material';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import { ReactElement, useEffect, useId, useState } from 'react';
import { STATE_EVENT_ROOM_NAME } from '../events';
import { NavigationBar } from '../NavigationPage';
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
    <>
      <NavigationBar title="Room Power Levels" />

      <MuiCapabilitiesGuard
        capabilities={[
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            STATE_EVENT_POWER_LEVELS,
          ),
          WidgetEventCapability.forStateEvent(
            EventDirection.Receive,
            STATE_EVENT_ROOM_MEMBER,
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
      </MuiCapabilitiesGuard>
    </>
  );
};

const PermittedIcon = ({ permitted }: { permitted: boolean }): ReactElement => {
  return (
    <ListItemIcon>
      {permitted ? (
        <CheckCircleIcon color="primary" />
      ) : (
        <CancelIcon color="error" />
      )}
    </ListItemIcon>
  );
};

const PermissionListItem = ({
  permitted,
  title,
}: {
  permitted: boolean;
  title: string;
}): ReactElement => {
  const titleId = useId();

  return (
    <ListItem aria-labelledby={titleId}>
      <PermittedIcon permitted={permitted} />
      <ListItemText primary={<span id={titleId}>{title}</span>} />
    </ListItem>
  );
};

export const PowerLevelsView = (): ReactElement => {
  const stateEventsListId = useId();
  const roomEventsListId = useId();
  const actionsListId = useId();
  const widgetApi = useWidgetApi();

  const { data: powerLevelsEvent } = useGetPowerLevelsQuery();
  const { data: roomMembersData } = useGetRoomMembersQuery();

  const [selectedMember, setSelectedMember] = useState<string | undefined>();

  // select the first member by default
  useEffect(() => {
    setSelectedMember((selected) => {
      if (selected === undefined) {
        return roomMembersData?.ids[0]?.toString();
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

  // check if we (=the user of the widget) has the power to promote or
  // demote others
  const canPromoteOrDemote = hasStateEventPower(
    powerLevelsEvent?.content,
    widgetApi.widgetParameters.userId,
    STATE_EVENT_POWER_LEVELS,
  );

  // we assume that users that can change the name can be promoted or demoted
  const userIsModerator = hasStateEventPower(
    powerLevelsEvent?.content,
    selectedMember,
    STATE_EVENT_ROOM_NAME,
  );

  return (
    <Box my={1}>
      <Box mx={1} mb={1} pt={1}>
        <FormControl fullWidth>
          <InputLabel id="username">Username</InputLabel>
          <Select
            labelId="username"
            label="Username"
            value={selectedMember ?? allMembers[0]?.state_key ?? ''}
            onChange={(data) =>
              setSelectedMember(data.target.value?.toString())
            }
          >
            {allMembers.map((member) => (
              <MenuItem key={member.state_key} value={member.state_key}>
                {getRoomMemberDisplayName(member, allMembers)}
                {member.state_key === widgetApi.widgetParameters.userId && (
                  <Chip label="You" sx={{ ml: 1 }} size="small" />
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <List
        subheader={
          <ListSubheader id={stateEventsListId} component="li">
            State Events
          </ListSubheader>
        }
        aria-labelledby={stateEventsListId}
      >
        {stateEventTypes.map((type) => (
          <PermissionListItem
            key={type}
            title={type}
            permitted={hasStateEventPower(
              powerLevelsEvent?.content,
              selectedMember,
              type,
            )}
          />
        ))}
      </List>

      <List
        subheader={
          <ListSubheader id={roomEventsListId} component="li">
            Room Events
          </ListSubheader>
        }
        aria-labelledby={roomEventsListId}
      >
        {roomEventTypes.map((type) => (
          <PermissionListItem
            key={type}
            title={type}
            permitted={hasRoomEventPower(
              powerLevelsEvent?.content,
              selectedMember,
              type,
            )}
          />
        ))}
      </List>

      <List
        subheader={
          <ListSubheader id={actionsListId} component="li">
            Actions
          </ListSubheader>
        }
        aria-labelledby={actionsListId}
      >
        {actions.map((action) => (
          <PermissionListItem
            key={action}
            title={action}
            permitted={hasActionPower(
              powerLevelsEvent?.content,
              selectedMember,
              action,
            )}
          />
        ))}
      </List>

      <Box mt={1} mx={1}>
        <ButtonGroup variant="outlined" fullWidth>
          <Button
            color="error"
            disabled={
              isMutating ||
              !canPromoteOrDemote ||
              !userIsModerator ||
              selectedMember === widgetApi.widgetParameters.userId
            }
            onClick={() =>
              selectedMember && updatePowerLevel(selectedMember, 0)
            }
          >
            Demote User
          </Button>
          <Button
            disabled={
              isMutating ||
              !canPromoteOrDemote ||
              userIsModerator ||
              selectedMember === widgetApi.widgetParameters.userId
            }
            onClick={() =>
              selectedMember && updatePowerLevel(selectedMember, 50)
            }
          >
            Promote User
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};
