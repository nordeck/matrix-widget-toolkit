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
import { Alert, AlertTitle, Box } from '@mui/material';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function MobileClientError(): ReactElement {
  const { t } = useTranslation('widget-toolkit');

  return (
    <Box m={2}>
      <Alert severity="error" icon={<ErrorIcon />}>
        <AlertTitle>
          {t('mobile-client.title', 'Mobile clients are not supported')}
        </AlertTitle>

        {t(
          'mobile-client.instructions',
          "The widget doesn't work in mobile clients due to technical limitations. Open the widget on your Desktop or Web client.",
        )}
      </Alert>
    </Box>
  );
}
