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
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Icon, Message } from 'semantic-ui-react';
import { CopyableCode } from './CopyableCode';

export function OutsideClientError(): ReactElement {
  const { t } = useTranslation('widget-toolkit');

  return (
    <Container>
      <Message icon attached error>
        <Icon name="exclamation triangle" />
        <Message.Content>
          <Message.Header>
            {t('outside-client.title', 'Only runs as a widget')}
          </Message.Header>
          {t(
            'outside-client.instructions',
            "You need to register this URL as a widget, it's not possible to use it standalone. Run this command in the matrix room you want to register the widget in:",
          )}
        </Message.Content>
      </Message>
      <CopyableCode
        attached
        code={`/addwidget ${generateWidgetRegistrationUrl({
          includeParameters: false,
        })}`}
      />
    </Container>
  );
}
