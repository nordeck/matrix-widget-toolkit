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
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import {
  EventDirection,
  MatrixCapabilities,
  UpdateDelayedEventAction,
  WidgetEventCapability,
} from 'matrix-widget-api';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { filter, map } from 'rxjs';
import { NavigationBar } from '../NavigationPage';
import {
  isValidThrowDiceEvent,
  STATE_EVENT_THROW_DICE,
  ThrowDiceEvent,
} from '../events';
import { isError } from '../utils';

/**
 * A component that reads and writes room events via the widget API.
 */
export const DicePage = (): ReactElement => {
  return (
    <>
      <NavigationBar title="Dice" />

      <Box m={1}>
        <MuiCapabilitiesGuard
          capabilities={[
            WidgetEventCapability.forRoomEvent(
              EventDirection.Receive,
              STATE_EVENT_THROW_DICE,
            ),
          ]}
        >
          <DiceView />
        </MuiCapabilitiesGuard>
      </Box>
    </>
  );
};

type Timeout = ReturnType<typeof setTimeout>;
const eventDelayMs = 10000;

export const DiceView = (): ReactElement => {
  const widgetApi = useWidgetApi();
  const [lastOwnDice, setLastOwnDice] = useState<number | undefined>();
  const [lastDelayId, setLastDelayId] = useState<string | undefined>();
  const [lastDelayIdExpired, setLastDelayIdExpired] = useState<boolean>(false);
  const [lastDelayError, setLastDelayError] = useState<string | undefined>();
  const [dices, setDices] = useState<number[]>([]);

  const lastDelayIdTimeoutRef = useRef<Timeout>();

  useEffect(() => {
    setDices([]);

    const subscription = widgetApi
      .observeRoomEvents(STATE_EVENT_THROW_DICE)
      .pipe(
        filter(isValidThrowDiceEvent),
        map((r) => r.content.pips),
      )
      .subscribe((d) => {
        setDices((l) => [...l, d]);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [widgetApi]);

  useEffect(() => {
    return () => {
      clearTimeout(lastDelayIdTimeoutRef.current);
    };
  }, []);

  async function handleThrowDice() {
    await widgetApi.requestCapabilities([
      WidgetEventCapability.forRoomEvent(
        EventDirection.Send,
        STATE_EVENT_THROW_DICE,
      ),
    ]);

    const pips = Math.floor(Math.random() * 6) + 1;
    const result = await widgetApi.sendRoomEvent<ThrowDiceEvent>(
      STATE_EVENT_THROW_DICE,
      { pips },
    );
    setLastOwnDice(result.content.pips);
  }

  async function handleThrowDiceDelayed() {
    await widgetApi.requestCapabilities([
      MatrixCapabilities.MSC4157SendDelayedEvent,
      WidgetEventCapability.forRoomEvent(
        EventDirection.Send,
        STATE_EVENT_THROW_DICE,
      ),
    ]);

    const pips = Math.floor(Math.random() * 6) + 1;
    try {
      const { delay_id } = await widgetApi.sendDelayedRoomEvent<ThrowDiceEvent>(
        STATE_EVENT_THROW_DICE,
        { pips },
        eventDelayMs,
      );
      setLastOwnDice(pips);
      setLastDelayId(delay_id);
      setLastDelayIdExpired(false);
      setLastDelayError(undefined);

      clearTimeout(lastDelayIdTimeoutRef.current);
      lastDelayIdTimeoutRef.current = setTimeout(() => {
        setLastDelayIdExpired(true);
      }, eventDelayMs);
    } catch {
      setLastDelayError(
        'Could not send a delayed event. Please check if homeserver supports delayed events.',
      );
    }
  }

  async function handleThrowDiceDelayedUpdate(
    action: UpdateDelayedEventAction,
  ) {
    if (!lastDelayId) {
      return;
    }

    await widgetApi.requestCapabilities([
      MatrixCapabilities.MSC4157UpdateDelayedEvent,
    ]);

    try {
      await widgetApi.updateDelayedEvent(lastDelayId, action);
      if (action !== UpdateDelayedEventAction.Restart) {
        setLastDelayIdExpired(true);
      }
      setLastDelayError(undefined);
    } catch (e) {
      setLastDelayError(isError(e) ? e.message : JSON.stringify(e));
    }
  }

  return (
    <>
      <Card elevation={0} sx={{ mt: 2 }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Dice Simulator
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {dices.length > 0 && <Dice pips={dices[dices.length - 1]} />}
            {dices.length === 0 &&
              'Nobody has thrown the dice in this room yet.'}
          </Typography>
        </CardContent>
      </Card>

      <Button
        sx={{ mt: 2 }}
        onClick={handleThrowDice}
        variant="contained"
        fullWidth
      >
        Throw dice
      </Button>

      <Button
        sx={{ mt: 2 }}
        onClick={handleThrowDiceDelayed}
        variant="outlined"
        fullWidth
      >
        Throw dice 10 seconds delayed
      </Button>

      {lastOwnDice && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Your last throw: <Dice pips={lastOwnDice} />
        </Alert>
      )}

      {lastDelayError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {lastDelayError}
        </Alert>
      )}

      {lastDelayId && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Your last delay id: {lastDelayId}
        </Alert>
      )}

      {lastDelayId && !lastDelayIdExpired && (
        <>
          <Typography sx={{ mt: 2 }} variant="h6">
            Throw dice delayed event actions:
          </Typography>

          <ButtonGroup sx={{ mt: 1 }} variant="outlined" fullWidth>
            {Object.values(UpdateDelayedEventAction).map((action) => (
              <Button
                key={action}
                color={
                  action === UpdateDelayedEventAction.Cancel
                    ? 'error'
                    : undefined
                }
                onClick={() => handleThrowDiceDelayedUpdate(action)}
              >
                {getTextForAction(action)}
              </Button>
            ))}
          </ButtonGroup>
        </>
      )}
    </>
  );
};

const pipsEmojis: Record<number, string> = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅',
};

export const Dice = ({ pips }: { pips: number }): ReactElement => {
  return <>{pipsEmojis[pips] ?? ''}</>;
};

function getTextForAction(action: UpdateDelayedEventAction) {
  return action.charAt(0).toUpperCase() + action.slice(1);
}
