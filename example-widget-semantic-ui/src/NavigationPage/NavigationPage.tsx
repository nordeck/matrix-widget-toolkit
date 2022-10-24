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

import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container, List } from 'semantic-ui-react';

export const NavigationPage = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Container>
      <List divided relaxed>
        <List.Item>
          <List.Content>
            <List.Header as={Link} to="/welcome">
              {t('navigation.welcome.title', 'Welcome')}
            </List.Header>
            <List.Description as="a">
              Example on widget parameters
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content>
            <List.Header as={Link} to="/identity">
              Identity
            </List.Header>
            <List.Description as="a">
              Example on using the OIDC token to check the user's identity
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content>
            <List.Header as={Link} to="/dice">
              Dice
            </List.Header>
            <List.Description as="a">
              Example on how room events are send and processed
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content>
            <List.Header as={Link} to="/room">
              Room
            </List.Header>
            <List.Description as="a">
              Example on how state events are processed
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content>
            <List.Header as={Link} to="/allrooms">
              All Rooms
            </List.Header>
            <List.Description as="a">
              Example on how to access events from a different room
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content>
            <List.Header as={Link} to="/modal">
              Modal
            </List.Header>
            <List.Description as="a">
              Example on how models are opened
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content>
            <List.Header as={Link} to="/powerlevels">
              Power Levels (Redux)
            </List.Header>
            <List.Description as="a">
              Example on how to interact with redux
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content>
            <List.Header as={Link} to="/theme">
              Theme
            </List.Header>
            <List.Description as="a">
              Example on how to build UIs using Semantic UI React that match the
              design of Element.
            </List.Description>
          </List.Content>
        </List.Item>
      </List>
    </Container>
  );
};
