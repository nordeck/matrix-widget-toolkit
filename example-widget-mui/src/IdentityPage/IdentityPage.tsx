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
import { Alert, AlertTitle, Box, Skeleton } from '@mui/material';
import { ReactElement } from 'react';
import { useAsync } from 'react-use';
import { NavigationBar } from '../NavigationPage';

/**
 * A component that requests the OpenIDConnect token via the widget API, and
 * shows the user that is connected to that.
 */
export const IdentityPage = (): ReactElement => {
  return (
    <>
      <NavigationBar title="Identity" />

      <Box m={1}>
        <IdentityView />
      </Box>
    </>
  );
};

export const IdentityView = (): ReactElement => {
  const widgetApi = useWidgetApi();

  const { value, error, loading } = useAsync(async () => {
    const oidcToken = await widgetApi.requestOpenIDConnectToken();

    if (!oidcToken.matrix_server_name) {
      throw new Error('Unknown home server');
    }

    if (oidcToken.token_type !== 'Bearer') {
      throw new Error('Unknown token type');
    }

    // Verify the token using the userinfo endpoint:
    // https://spec.matrix.org/v1.2/server-server-api/#openid
    const url = `https://${oidcToken.matrix_server_name}/_matrix/federation/v1/openid/userinfo?access_token=${oidcToken.access_token}`;
    const response = await fetch(url);
    const value = await response.json();

    if (!response.ok) {
      throw new Error(
        `Error while retrieving identity: ${JSON.stringify(
          value,
          undefined,
          '  ',
        )}`,
      );
    }

    return value;
  }, [widgetApi]);

  if (loading) {
    return <Skeleton variant="rectangular" height={100} />;
  } else if (value) {
    return (
      <Alert severity="success">
        <AlertTitle>Identity Verified</AlertTitle>

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
