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

import { Box, CircularProgress, Typography } from '@mui/material';
import { unstable_useId as useId } from '@mui/utils';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimeout } from 'react-use';

export function LoadingView(): ReactElement {
  const id = useId();
  const [isLongLoad] = useTimeout(100);
  const { t } = useTranslation('widget-toolkit');

  return isLongLoad() ? (
    <Box display="flex" flexDirection="column" alignItems="center" p={2}>
      <CircularProgress aria-labelledby={id} />

      <Typography py={2} variant="h6" id={id}>
        {t('loading.message', 'Loading…')}
      </Typography>
    </Box>
  ) : (
    <></>
  );
}
