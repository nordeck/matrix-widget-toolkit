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

import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { Box, IconButton, Paper } from '@mui/material';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCopyToClipboard } from 'react-use';

export function CopyableCode({ code }: { code: string }): ReactElement {
  const { t } = useTranslation('widget-toolkit');
  const [hasCopied, setHasCopied] = useState(false);
  const [, copyToClipboard] = useCopyToClipboard();

  return (
    <Paper sx={{ position: 'relative' }}>
      <Box sx={{ overflowY: 'auto' }}>
        <Box component="code" sx={{ userSelect: 'all' }} m={0}>
          <Box component="pre" m={2}>
            {code}
          </Box>
        </Box>

        <IconButton
          sx={(theme) => ({
            position: 'absolute',
            right: theme.spacing(1),
            bottom: theme.spacing(1),
          })}
          onClick={() => {
            copyToClipboard(code);
            setHasCopied(true);
          }}
          onBlur={() => setHasCopied(false)}
          aria-label={t('code.copy-to-clipboard', 'Copy to clipboard')}
        >
          {hasCopied ? <CheckOutlinedIcon /> : <ContentCopyOutlinedIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
}
