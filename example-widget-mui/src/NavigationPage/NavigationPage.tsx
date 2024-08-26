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

import { Box, List, ListItemButton, ListItemText } from '@mui/material';
import { ReactElement, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const NavigationItem = ({
  to,
  title,
  description,
}: {
  to: string;
  title: string;
  description: string;
}): ReactElement => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <li aria-labelledby={titleId} aria-describedby={descriptionId}>
      <ListItemButton component={Link} to={to}>
        <ListItemText
          primary={<span id={titleId}>{title}</span>}
          secondary={<span id={descriptionId}>{description}</span>}
        />
      </ListItemButton>
    </li>
  );
};

export const NavigationPage = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Box component="nav">
      <List aria-label="Navigation">
        <NavigationItem
          to="/welcome"
          title={t('navigation.welcome.title', 'Welcome')}
          description="Example on widget parameters"
        />

        <NavigationItem
          to="/identity"
          title="Identity"
          description="Example on using the OIDC token to check the user's identity"
        />

        <NavigationItem
          to="/dice"
          title="Dice"
          description="Example on how room events are send and processed"
        />

        <NavigationItem
          to="/room"
          title="Room Admin Tool"
          description="Example on how state events are processed"
        />

        <NavigationItem
          to="/allrooms"
          title="All Rooms"
          description="Example on how to access events from a different room"
        />

        <NavigationItem
          to="/modal"
          title="Modal"
          description="Example on how models are opened"
        />

        <NavigationItem
          to="/powerlevels"
          title="Power Levels (Redux)"
          description="Example on how to interact with redux"
        />

        <NavigationItem
          to="/relations"
          title="Event relations"
          description="Example on how to read related events"
        />

        <NavigationItem
          to="/invitations"
          title="User Directory and Invitations"
          description="Example on how to search the user directory"
        />

        <NavigationItem
          to="/theme"
          title="Theme"
          description="Example on how to build UIs using Mui that match the
          design of Element"
        />
        <NavigationItem
          to="/image"
          title="Up- and download image"
          description="Example for up- and downloading an image file"
        />
      </List>
    </Box>
  );
};
