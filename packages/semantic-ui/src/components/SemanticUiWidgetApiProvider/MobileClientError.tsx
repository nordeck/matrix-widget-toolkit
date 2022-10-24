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

export function MobileClientError(): ReactElement {
  const { t } = useTranslation('widget-toolkit');

  return (
    <Container>
      <Message icon attached error>
        <Icon name="exclamation triangle" />
        <Message.Content>
          <Message.Header>
            {t('mobile-client.title', 'Mobile clients are not supported')}
          </Message.Header>
          {t(
            'mobile-client.instructions',
            "The widget doesn't work in mobile clients due to technical limitations. Open the widget on you Desktop or Web client."
          )}
        </Message.Content>
      </Message>
    </Container>
  );
}
