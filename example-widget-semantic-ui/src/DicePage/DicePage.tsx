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

import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { SemanticUiCapabilitiesGuard } from '@matrix-widget-toolkit/semantic-ui';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import { ReactElement, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { filter, map } from 'rxjs';
import {
  Button,
  Container,
  Divider,
  Header,
  Icon,
  Message,
  Segment,
  Statistic,
} from 'semantic-ui-react';
import {
  isValidThrowDiceEvent,
  STATE_EVENT_THROW_DICE,
  ThrowDiceEvent,
} from '../events';

/**
 * A component that reads and writes room events via the widget API.
 */
export const DicePage = (): ReactElement => {
  return (
    <Container>
      <Button icon labelPosition="left" as={Link} to="/">
        <Icon name="arrow alternate circle left outline" />
        Back to navigation
      </Button>

      <Divider />

      <SemanticUiCapabilitiesGuard
        capabilities={[
          WidgetEventCapability.forRoomEvent(
            EventDirection.Receive,
            STATE_EVENT_THROW_DICE,
          ),
        ]}
      >
        <DiceView />
      </SemanticUiCapabilitiesGuard>
    </Container>
  );
};

export const DiceView = (): ReactElement => {
  const widgetApi = useWidgetApi();
  const [lastOwnDice, setLastOwnDice] = useState<number | undefined>();
  const [dices, setDices] = useState<number[]>([]);

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

  return (
    <>
      <Segment attached>
        <Header>Dice Simulator</Header>

        <Statistic>
          {dices.length > 0 && (
            <Statistic.Value>
              <Dice pips={dices[dices.length - 1]} />
            </Statistic.Value>
          )}
          {dices.length === 0 && (
            <Statistic.Label>
              Nobody has thrown the dice in this room yet.
            </Statistic.Label>
          )}
        </Statistic>
      </Segment>

      <Button onClick={handleThrowDice} attached="bottom" primary>
        Throw dice
      </Button>

      {lastOwnDice && (
        <Message floating>
          Your last throw: <Dice pips={lastOwnDice} />
        </Message>
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
