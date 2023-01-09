/*
 * Copyright 2023 Nordeck IT + Consulting GmbH
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

import * as Automerge from '@automerge/automerge';
import { CollaborativeDoc } from './types';

export function generateInitSchemaChange(): Uint8Array {
  let schema = Automerge.change(
    Automerge.init<CollaborativeDoc>('0000'),
    { time: 0 },
    (doc) => {
      doc.text = new Automerge.Text();
      doc.count = new Automerge.Counter(0);
    }
  );
  let initSchemaChange = Automerge.getLastLocalChange(schema);

  if (!initSchemaChange) {
    throw new Error('Unreachable');
  }

  return initSchemaChange;
}
