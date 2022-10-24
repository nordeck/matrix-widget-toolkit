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

import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Icon, Message } from 'semantic-ui-react';
import { CopyableCode } from './CopyableCode';

export function ChildError({ error }: { error: Error }): ReactElement {
  const { t } = useTranslation('widget-toolkit');

  return (
    <Container style={{ margin: 8 }}>
      <Message icon attached error>
        <Icon name="exclamation triangle" />
        <Message.Content>
          <Message.Header>{t('error.title', 'Ohh no!')}</Message.Header>
          {t(
            'error.instructions',
            'An error occured inside the widget. You can try to reopen the widget.'
          )}
        </Message.Content>
      </Message>
      <CopyableCode attached code={`${error.stack ?? error}`} />
    </Container>
  );
}
