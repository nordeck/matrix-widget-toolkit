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

import { generateWidgetRegistrationUrl } from '@matrix-widget-toolkit/api';
import ErrorIcon from '@mui/icons-material/Error';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyableCode } from './CopyableCode';

export function OutsideClientError(): ReactElement {
  const { t } = useTranslation('widget-toolkit');

  return (
    <Box m={2}>
      <Alert severity="error" icon={<ErrorIcon />}>
        <AlertTitle>
          {t('outside-client.title', 'Only runs as a widget')}
        </AlertTitle>

        <Typography variant="body2">
          {t(
            'outside-client.instructions',
            "You need to register this URL as a widget, it's not possible to use it standalone. Run this command in the matrix room you want to register the widget in:",
          )}
        </Typography>

        <Box mt={1}>
          <CopyableCode
            code={`/addwidget ${generateWidgetRegistrationUrl({
              includeParameters: false,
            })}`}
          />
        </Box>
      </Alert>
    </Box>
  );
}
