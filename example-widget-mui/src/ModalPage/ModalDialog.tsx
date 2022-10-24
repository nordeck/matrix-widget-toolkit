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
import { Box, Button, Typography } from '@mui/material';
import { ReactElement, useCallback, useEffect } from 'react';
import { useAsync } from 'react-use';

export const ModalButtonYes = 'net.nordeck.create.poll.yes';
export const ModalButtonYesTotally = 'net.nordeck.create.poll.yessssss';
export const ModalButtonNo = 'net.nordeck.create.poll.no';

export type ModalInputData = { title: string };

export type ModalResult = {
  result: string;
};

/**
 * A component that is rendered in a dialog. It is registered as a route at
 * `/modal/dialog` and {@link ModalPage} opens the modal using
 * `widgetApi.openModal('/modal/dialog', ...)`.
 */
export const ModalDialog = (): ReactElement => {
  const widgetApi = useWidgetApi();
  const widgetConfig = widgetApi.getWidgetConfig<ModalInputData>();

  // enable the buttons once the widget is ready
  useAsync(async () => {
    await widgetApi.setModalButtonEnabled(ModalButtonYes, true);
    await widgetApi.setModalButtonEnabled(ModalButtonNo, true);
  }, [widgetApi]);

  const handleClickUseConfidentMode = useCallback(async () => {
    await widgetApi.setModalButtonEnabled(ModalButtonYesTotally, true);
  }, [widgetApi]);

  useEffect(() => {
    const subscription = widgetApi
      .observeModalButtons()
      .subscribe(async (buttonId) => {
        switch (buttonId) {
          case ModalButtonYes:
            await widgetApi.closeModal<ModalResult>({ result: 'Yes!' });
            break;

          case ModalButtonYesTotally:
            await widgetApi.closeModal<ModalResult>({ result: 'Yes Totally!' });
            break;

          case ModalButtonNo:
            await widgetApi.closeModal<ModalResult>({ result: 'No!' });
            break;
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  });

  if (!widgetConfig) {
    return <p>This widget was not opened in a modal.</p>;
  }

  return (
    <Box m={1}>
      <Typography variant="h6" component="h3">
        {widgetConfig.data.title}
      </Typography>

      <p>Some Content…</p>
      <p>Room ID: {widgetApi.widgetParameters.roomId}</p>

      <Button onClick={handleClickUseConfidentMode} variant="contained">
        I am confident!
      </Button>
    </Box>
  );
};
