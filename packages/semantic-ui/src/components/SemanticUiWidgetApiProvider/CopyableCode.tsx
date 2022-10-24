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

import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCopyToClipboard } from 'react-use';
import { Button, Icon, Segment } from 'semantic-ui-react';

export function CopyableCode({
  code,
  attached = false,
}: {
  code: string;
  attached?: boolean;
}): ReactElement {
  const { t } = useTranslation('widget-toolkit');
  const [hasCopied, setHasCopied] = useState(false);
  const [, copyToClipboard] = useCopyToClipboard();

  return (
    <Segment inverted attached={attached} style={{ position: 'relative' }}>
      <Button
        icon
        style={{ position: 'absolute', right: 8, bottom: 8 + 8 }}
        onClick={() => {
          copyToClipboard(code);
          setHasCopied(true);
        }}
        onBlur={() => setHasCopied(false)}
        aria-label={t('code.copy-to-clipboard', 'Copy to clipboard')}
      >
        <Icon name={hasCopied ? 'check' : 'copy'} />
      </Button>

      <div style={{ overflowY: 'auto' }}>
        <code style={{ userSelect: 'all' }}>
          <pre style={{ margin: 0, marginTop: 8 }}>{code}</pre>
        </code>
      </div>
    </Segment>
  );
}
