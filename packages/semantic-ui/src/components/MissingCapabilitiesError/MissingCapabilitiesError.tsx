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

import { DispatchWithoutAction, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Container, Icon, Message } from 'semantic-ui-react';

export function MissingCapabilitiesError({
  onRetry,
}: {
  onRetry: DispatchWithoutAction;
}): ReactElement {
  const { t } = useTranslation('widget-toolkit');

  return (
    <Container>
      <Message icon attached error>
        <Icon name="exclamation triangle" />
        <Message.Content>
          <Message.Header>
            {t('missing-capabilities.title', 'Missing capabilities')}
          </Message.Header>
          {t(
            'missing-capabilities.instructions',
            'The minimum capabilities required for this widget are missing. Make sure to grant all requested capabilities.'
          )}
        </Message.Content>
      </Message>

      <Button attached="bottom" primary onClick={onRetry}>
        {t('missing-capabilities.request-capabilities', 'Request capabilities')}
      </Button>
    </Container>
  );
}
