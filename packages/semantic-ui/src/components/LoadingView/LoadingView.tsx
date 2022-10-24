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
import { useTimeout } from 'react-use';
import { Container, Loader } from 'semantic-ui-react';

export function LoadingView(): ReactElement {
  const [isLongLoad] = useTimeout(100);
  const { t } = useTranslation('widget-toolkit');

  return isLongLoad() ? (
    <Container>
      <Loader active inline="centered" size="huge">
        {t('loading.message', 'Loading…')}
      </Loader>
    </Container>
  ) : (
    <></>
  );
}
