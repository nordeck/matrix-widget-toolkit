/*
 * Copyright 2026 Nordeck IT + Consulting GmbH
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
import { Alert, AlertTitle, Box, Skeleton } from '@mui/material';
import { MatrixCapabilities } from 'matrix-widget-api';
import { ReactElement } from 'react';
import { useAsync } from 'react-use';
import { NavigationBar } from '../NavigationPage';

export const RtcTransportsPage = (): ReactElement => {
  return (
    <>
      <NavigationBar title="RTC Transports" />

      <Box m={1}>
        <RtcTransportsView />
      </Box>
    </>
  );
};

const RtcTransportsView = (): ReactElement => {
  const widgetApi = useWidgetApi();

  const { value, error, loading } = useAsync(async () => {
    await widgetApi.requestCapabilities([
      MatrixCapabilities.MSC4515RtcTransports,
    ]);

    return await widgetApi.getRtcTransports();
  }, [widgetApi]);

  if (loading) {
    return <Skeleton variant="rectangular" height={100} />;
  } else if (value) {
    return (
      <Alert severity="success">
        <AlertTitle>RTC Transports</AlertTitle>

        <code>
          <pre>{JSON.stringify(value, undefined, '  ')}</pre>
        </code>
      </Alert>
    );
  } else if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>

        <code>
          <pre>{`${error}`}</pre>
        </code>
      </Alert>
    );
  } else {
    return <></>;
  }
};
