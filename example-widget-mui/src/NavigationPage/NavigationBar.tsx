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

import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function NavigationBar({ title }: { title: string }) {
  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="Back to navigation"
          sx={{ mr: 2 }}
          component={Link}
          to="/"
        >
          <ArrowCircleLeftIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" component="h1">
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
