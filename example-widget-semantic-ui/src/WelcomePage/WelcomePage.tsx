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
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Container,
  Divider,
  Icon,
  Image,
  Message,
} from 'semantic-ui-react';

/**
 * A component that shows the user information that were given in the widget URL.
 */
export const WelcomePage = (): ReactElement => {
  const widgetApi = useWidgetApi();
  const userDisplayName =
    widgetApi.widgetParameters.displayName ?? widgetApi.widgetParameters.userId;

  return (
    <Container>
      <Button icon labelPosition="left" as={Link} to="/">
        <Icon name="arrow alternate circle left outline" />
        Back to navigation
      </Button>

      <Divider />

      <Message icon>
        <Image src={widgetApi.widgetParameters.avatarUrl} avatar />
        <Message.Content>
          <Message.Header>Welcome {userDisplayName}</Message.Header>
        </Message.Content>
      </Message>
    </Container>
  );
};
