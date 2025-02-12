/*
 * Copyright 2025 Nordeck IT + Consulting GmbH
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
  MatrixRTCClient,
  MatrixRTCSession,
} from '@matrix-widget-toolkit/matrixrtc';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { ReactElement, useEffect } from 'react';
import { NavigationBar } from '../NavigationPage';

/**
 * An example component for realtime communcations using Matrix RTC.
 */
export const RealtimePage = (): ReactElement => {
  const widgetApi = useWidgetApi();

  useEffect(() => {
    const rtcClient = new MatrixRTCClient(widgetApi);
    const room = rtcClient.getRoom(widgetApi.widgetParameters.roomId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const session = MatrixRTCSession.roomSessionForRoom(rtcClient, room);
  });

  return (
    <>
      <NavigationBar title="Realtime Communications with Matrix RTC" />

      <Box m={1}>
        <Alert severity="info">
          <AlertTitle>RTC Connection Status</AlertTitle>
          <Typography variant="body1" color="text.secondary">
            Disconnected
          </Typography>
        </Alert>

        <Card elevation={0}>
          <CardContent>
            <Button variant="contained" component="span">
              Join RTC Session
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};
