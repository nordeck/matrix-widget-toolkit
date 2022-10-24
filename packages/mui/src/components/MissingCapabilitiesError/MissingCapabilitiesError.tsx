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

import ErrorIcon from '@mui/icons-material/Error';
import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import { DispatchWithoutAction, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function MissingCapabilitiesError({
  onRetry,
}: {
  onRetry: DispatchWithoutAction;
}): ReactElement {
  const { t } = useTranslation('widget-toolkit');

  return (
    <Box my={2}>
      <Alert severity="error" icon={<ErrorIcon />}>
        <AlertTitle>
          {t('missing-capabilities.title', 'Missing capabilities')}
        </AlertTitle>

        <Typography variant="body2">
          {t(
            'missing-capabilities.instructions',
            'The minimum capabilities required for this widget are missing. Make sure to grant all requested capabilities.'
          )}
        </Typography>

        <Box mt={1}>
          <Button variant="contained" onClick={onRetry}>
            {t(
              'missing-capabilities.request-capabilities',
              'Request capabilities'
            )}
          </Button>
        </Box>
      </Alert>
    </Box>
  );
}
