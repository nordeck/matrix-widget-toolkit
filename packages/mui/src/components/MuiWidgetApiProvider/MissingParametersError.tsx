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

import {
  generateWidgetRegistrationUrl,
  repairWidgetRegistration,
  WidgetRegistration,
} from '@matrix-widget-toolkit/api';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import { unstable_useId as useId } from '@mui/utils';
import { ReactElement, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyableCode } from './CopyableCode';

// TODO: In the future we might replace this with a more full-featured
// onboarding dialog that configures widget specific configuration on
// first run by an admin and show a message that configuration is pending
// to non-admins.
// For example, we could first navigate to a /setup route that onboards the
// user (or shows non admins an error). The dialog has to be configurable, e.g.
// being able to set permissions for events, …
// It should also be possible to open the setup dialog again to fix/update
// the configuration.
// We can then set a "onboarding completed" flag inside data of the widget
// configuration and pass the variables in data into the widget. We would also
// need a way to configure which parameters in data should be available to the
// widget.
// Parameters like widget name and avatar could have default values, but the
// onboarding screen could make them configurable.

export const STATE_EVENT_WIDGETS = 'im.vector.modular.widgets';

export function MissingParametersError({
  widgetRegistration,
}: {
  widgetRegistration?: WidgetRegistration;
}): ReactElement {
  const { t } = useTranslation('widget-toolkit');
  const widgetApi = useWidgetApi();
  const [isErrorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [isCompleted, setCompleted] = useState<boolean>(false);
  const handleRepairWidget = useCallback(async () => {
    try {
      await repairWidgetRegistration(widgetApi, widgetRegistration);
      setCompleted(true);
    } catch {
      setErrorDialogOpen(true);
    }
  }, [widgetApi, widgetRegistration]);
  const errorDialogTitleId = useId();
  const errorDialogTextId = useId();
  const successDialogTitleId = useId();
  const successDialogTextId = useId();

  return (
    <Box my={2}>
      <Alert severity="error" icon={<ErrorIcon />}>
        <AlertTitle>
          {t('missing-parameters.title', 'Wrong widget registration')}
        </AlertTitle>

        <Typography variant="body2">
          {t(
            'missing-parameters.instructions',
            'The widget is not registered correctly. Make sure to include the correct parameters in the widget URL:'
          )}
        </Typography>

        <Box my={1}>
          <CopyableCode code={generateWidgetRegistrationUrl()} />
        </Box>

        <Typography variant="body2">
          {t(
            'missing-parameters.repair-instructions',
            'You can either modify the widget registration manually or fix it automatically:'
          )}
        </Typography>

        <Box mt={1}>
          <Button variant="contained" onClick={handleRepairWidget}>
            {t('missing-parameters.repair', 'Repair registration')}
          </Button>
        </Box>
      </Alert>

      <Dialog
        open={isErrorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        aria-labelledby={errorDialogTitleId}
        aria-describedby={errorDialogTextId}
      >
        <DialogTitle id={errorDialogTitleId}>
          {t('missing-parameters.permissions-error.title', 'Error')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id={errorDialogTextId}>
            {t(
              'missing-parameters.permissions-error.instructions',
              'Insufficient permissions, could not configure widget. Only room admins can configure the widget.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)} autoFocus>
            {t('missing-parameters.permissions-error.close', 'Close')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isCompleted}
        aria-labelledby={successDialogTitleId}
        aria-describedby={successDialogTextId}
      >
        <DialogTitle id={successDialogTitleId}>
          {t(
            'missing-parameters.completed.title',
            'Widget configuration complete'
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id={successDialogTextId}>
            {t(
              'missing-parameters.completed.instructions',
              'Configuration completed, reopen the widget to start using it.'
            )}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
