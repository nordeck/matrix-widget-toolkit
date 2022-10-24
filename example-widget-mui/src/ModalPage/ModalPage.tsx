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
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { ModalButtonKind } from 'matrix-widget-api';
import { ReactElement, useCallback, useState } from 'react';
import { NavigationBar } from '../NavigationPage';
import {
  ModalButtonNo,
  ModalButtonYes,
  ModalButtonYesTotally,
  ModalInputData,
  ModalResult,
} from './ModalDialog';

/**
 * A component that opens a modal via the widget API and waits for the response.
 */
export const ModalPage = (): ReactElement => {
  const widgetApi = useWidgetApi();
  const [modalResult, setModalResult] = useState<string | undefined>();

  const handleOpenModal = useCallback(async () => {
    setModalResult(undefined);

    const data = await widgetApi.openModal<ModalResult, ModalInputData>(
      '/modal/dialog',
      'How do you feel?',
      {
        buttons: [
          {
            id: ModalButtonYes,
            kind: ModalButtonKind.Primary,
            label: 'Yes!',
            disabled: true,
          },
          {
            id: ModalButtonYesTotally,
            kind: ModalButtonKind.Danger,
            label: 'Totally Yes!',
            disabled: true,
          },
          {
            id: ModalButtonNo,
            kind: ModalButtonKind.Secondary,
            label: 'No!',
            disabled: true,
          },
        ],
        data: { title: 'This is a custom title!' },
      }
    );

    if (!data) {
      setModalResult('No answer :-(');
    } else {
      setModalResult(data.result);
    }
  }, [widgetApi]);

  return (
    <>
      <NavigationBar title="Example for modals" />

      <Box m={1}>
        <Button onClick={handleOpenModal} variant="contained" fullWidth>
          Open Modal
        </Button>

        {modalResult && (
          <Alert severity="info" sx={{ mt: 1 }}>
            <AlertTitle>Result:</AlertTitle>
            {modalResult}
          </Alert>
        )}
      </Box>
    </>
  );
};
