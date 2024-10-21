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
  hasActionPower,
  hasRoomEventPower,
  hasStateEventPower,
  isValidPowerLevelStateEvent,
  ROOM_EVENT_REDACTION,
  STATE_EVENT_POWER_LEVELS,
} from '@matrix-widget-toolkit/api';
import { MuiCapabilitiesGuard } from '@matrix-widget-toolkit/mui';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  unstable_useId as useId,
} from '@mui/material';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import { FormEvent, ReactElement, ReactNode, useMemo, useState } from 'react';
import { useObservable } from 'react-use';
import { filter, map } from 'rxjs';
import {
  ROOM_EVENT_REACTION,
  ROOM_EVENT_ROOM_MESSAGE,
  STATE_EVENT_MESSAGE_COLLECTION,
} from '../events';
import { NavigationBar } from '../NavigationPage';
import { StoreProvider } from '../store';
import { isError } from '../utils';
import {
  useDropMessageFromCollectionMutation,
  useGetMessageQuery,
  useGetRelevantEventsQuery,
  useSendMessageMutation,
  useSendReactionMutation,
  useSendRedactionMutation,
} from './roomMessagesApi';
/**
 * A component that reads and writes related room events via the widget API.
 */
export const RelationsPage = (): ReactElement => {
  return (
    <>
      <NavigationBar title="Event Relations" />

      <Box m={1}>
        <MuiCapabilitiesGuard
          capabilities={[
            WidgetEventCapability.forStateEvent(
              EventDirection.Receive,
              STATE_EVENT_POWER_LEVELS,
            ),
            WidgetEventCapability.forStateEvent(
              EventDirection.Receive,
              STATE_EVENT_MESSAGE_COLLECTION,
            ),
            WidgetEventCapability.forStateEvent(
              EventDirection.Send,
              STATE_EVENT_MESSAGE_COLLECTION,
            ),
            WidgetEventCapability.forRoomEvent(
              EventDirection.Receive,
              ROOM_EVENT_ROOM_MESSAGE,
            ),
            WidgetEventCapability.forRoomEvent(
              EventDirection.Send,
              ROOM_EVENT_ROOM_MESSAGE,
            ),
            WidgetEventCapability.forRoomEvent(
              EventDirection.Receive,
              ROOM_EVENT_REACTION,
            ),
            WidgetEventCapability.forRoomEvent(
              EventDirection.Send,
              ROOM_EVENT_REACTION,
            ),
            WidgetEventCapability.forRoomEvent(
              EventDirection.Receive,
              ROOM_EVENT_REDACTION,
            ),
            WidgetEventCapability.forRoomEvent(
              EventDirection.Send,
              ROOM_EVENT_REDACTION,
            ),
          ]}
        >
          {/* 
          The StoreProvider is located here to keep the example small. Normal
          applications would located it outside of the router to establish a
          single, global store.
          */}
          <StoreProvider>
            <RelationsView />
          </StoreProvider>
        </MuiCapabilitiesGuard>
      </Box>
    </>
  );
};

export const RelationsView = (): ReactElement => {
  const { data, error } = useGetRelevantEventsQuery();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [message, setMessage] = useState('');

  const { canEdit, canSendReaction, canSendRedaction } = usePermissions();

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();

    await sendMessage({ message });
    setMessage('');
  };

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>An Error occurred</AlertTitle>
        {isError(error) && error.message}
      </Alert>
    );
  }

  return (
    <>
      {canEdit ? (
        <>
          <Stack direction={'row'} gap={1} onSubmit={onSubmit} component="form">
            <InputBase
              sx={{ flex: 1 }}
              id="message"
              value={message}
              onChange={(ev) => setMessage(ev.target.value)}
              inputProps={{ 'aria-label': 'Send a message' }}
              placeholder="Send a message"
            />
            <Button type="submit" disabled={isSending}>
              Send
            </Button>
          </Stack>

          <Divider />
        </>
      ) : (
        <Alert role="presentation" severity="info">
          You don't have the permission to send new messages.
        </Alert>
      )}

      <List aria-label="Messages" dense>
        {data?.map((eventId) => (
          <MessageEntry
            key={eventId}
            eventId={eventId}
            canEdit={canEdit}
            canReact={canSendReaction}
            canRedact={canSendRedaction}
          />
        ))}
      </List>
    </>
  );
};

const MessageEntry = ({
  eventId,
  canEdit,
  canReact,
  canRedact,
}: {
  eventId: string;
  canEdit: boolean;
  canReact: boolean;
  canRedact: boolean;
}) => {
  const { data, error, isLoading } = useGetMessageQuery({ eventId });
  const [dropMessage, { isLoading: isLoadingDropMessage }] =
    useDropMessageFromCollectionMutation();

  const messageId = useId();
  const authorId = useId();

  if (error) {
    return (
      <ListItem
        sx={{ flexDirection: 'row-reverse' }}
        aria-labelledby={messageId}
        secondaryAction={
          canEdit && (
            <Tooltip title="Remove from collection">
              <IconButton
                onClick={async () => {
                  await dropMessage({ eventId });
                }}
                disabled={isLoadingDropMessage}
                aria-describedby={messageId}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )
        }
      >
        <ListItemText
          primary={`Error loading event ${eventId}`}
          primaryTypographyProps={{ color: 'error', id: messageId }}
          secondary={error.message}
        />
        <ListItemIcon>
          <ErrorIcon color="error" />
        </ListItemIcon>
      </ListItem>
    );
  }

  if (isLoading) {
    return (
      <ListItem sx={{ flexDirection: 'row-reverse' }}>
        <ListItemText primary={<Skeleton />} secondary={<Skeleton />} />
        <ListItemIcon>
          <Skeleton variant="circular" height={24} width={24} sx={{ m: 1 }} />
          <Skeleton variant="circular" height={24} width={24} sx={{ m: 1 }} />
        </ListItemIcon>
      </ListItem>
    );
  }

  return (
    <ListItem
      sx={{ flexDirection: 'row-reverse' }}
      aria-labelledby={`${messageId} ${authorId}`}
    >
      <ListItemText
        primary={
          data?.event?.content.body ?? `Unknown Message (ID: ${eventId})`
        }
        primaryTypographyProps={{ id: messageId }}
        secondary={data?.event?.sender ?? 'Unknown Author'}
        secondaryTypographyProps={{ id: authorId }}
      />
      <ListItemIcon>
        <ReactionButton
          eventId={eventId}
          icon={<AcUnitIcon />}
          iconLabel="Snowflake"
          reaction="❄️"
          aria-describedby={`${messageId} ${authorId}`}
          canReact={canReact}
          canRedact={canRedact}
        />
        <ReactionButton
          eventId={eventId}
          icon={<CheckIcon />}
          iconLabel="Thumbs Up"
          reaction="👍️"
          aria-describedby={`${messageId} ${authorId}`}
          canReact={canReact}
          canRedact={canRedact}
        />
      </ListItemIcon>
    </ListItem>
  );
};

const ReactionButton = ({
  eventId,
  reaction,
  icon,
  iconLabel,
  'aria-describedby': ariaDescribedBy,
  canReact,
  canRedact,
}: {
  eventId: string;
  reaction: string;
  icon: ReactNode;
  iconLabel: string;
  canReact: boolean;
  canRedact: boolean;
  'aria-describedby'?: string;
}) => {
  const widgetApi = useWidgetApi();
  const { data } = useGetMessageQuery({ eventId });
  const [sendReaction, { isLoading: isLoadingReaction }] =
    useSendReactionMutation();
  const [sendRedaction, { isLoading: isLoadingRedaction }] =
    useSendRedactionMutation();

  const isLoading = isLoadingReaction || isLoadingRedaction;

  const reactionEvent = data?.reactions.find(
    (r) =>
      r.sender === widgetApi.widgetParameters.userId &&
      r.content['m.relates_to'].key === reaction,
  );

  const onClick = () => {
    if (reactionEvent) {
      sendRedaction({ eventId: reactionEvent.event_id });
    } else {
      sendReaction({ eventId, reaction });
    }
  };

  return (
    <IconButton
      aria-label={
        reactionEvent
          ? `Remove reaction "${iconLabel}"`
          : `Add reaction "${iconLabel}"`
      }
      aria-describedby={ariaDescribedBy}
      aria-pressed={Boolean(reactionEvent)}
      disabled={isLoading || reactionEvent ? !canRedact : !canReact}
      color={reactionEvent ? 'primary' : 'inherit'}
      onClick={onClick}
    >
      {icon}
    </IconButton>
  );
};

function usePermissions() {
  const widgetApi = useWidgetApi();

  const observable = useMemo(
    () =>
      widgetApi.observeStateEvents('m.room.power_levels').pipe(
        filter(isValidPowerLevelStateEvent),
        map((ev) => ({
          canEdit:
            hasStateEventPower(
              ev.content,
              widgetApi.widgetParameters.userId,
              STATE_EVENT_MESSAGE_COLLECTION,
            ) &&
            hasRoomEventPower(
              ev.content,
              widgetApi.widgetParameters.userId,
              ROOM_EVENT_REDACTION,
            ) &&
            hasActionPower(
              ev.content,
              widgetApi.widgetParameters.userId,
              'redact',
            ),
          canSendReaction: hasRoomEventPower(
            ev.content,
            widgetApi.widgetParameters.userId,
            ROOM_EVENT_REACTION,
          ),
          canSendRedaction: hasRoomEventPower(
            ev.content,
            widgetApi.widgetParameters.userId,
            ROOM_EVENT_REDACTION,
          ),
        })),
      ),
    [widgetApi],
  );

  return useObservable(observable, {
    canEdit: false,
    canSendReaction: false,
    canSendRedaction: false,
  });
}
