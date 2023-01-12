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

describe('ordering', () => {
  /*it('should handle conflicting additions', () => {
    const baseDoc = Automerge.from<{
      elements: Record<string, { text: string; order: number }>;
    }>({ elements: { a: { text: 'a', order: 0 } } });

    const aliceDoc = Automerge.change(Automerge.clone(baseDoc), (doc) => {
      doc.items.push({
        key: 'alice',
      });
    });
    const bobDoc = Automerge.change(Automerge.clone(baseDoc), (doc) => {
      doc.items.push({
        key: 'bob',
      });
    });

    const result = Automerge.merge(Automerge.clone(aliceDoc), bobDoc);

    expect(Automerge.toJS(result)).toEqual({
      items: expect.arrayContaining([{ key: 'alice' }, { key: 'bob' }]),
    });
  });*/

  it.skip('should handle conflicting changes in array', () => {
    const baseDoc = Automerge.from<{ items: { key: string }[] }>({
      items: [
        {
          key: 'alice',
        },
        {
          key: 'bob',
        },
      ],
    });

    const aliceDoc = Automerge.change(Automerge.clone(baseDoc), (doc) => {
      doc.items[0].key += 'alice';
    });
    const bobDoc = Automerge.change(Automerge.clone(baseDoc), (doc) => {
      doc.items[1].key += 'bob';
    });

    const result = Automerge.merge(Automerge.clone(aliceDoc), bobDoc);

    expect(Automerge.toJS(result)).toEqual({
      items: expect.arrayContaining([{ key: 'alicealice' }, { key: 'bobbob' }]),
    });
  });

  it('should handle conflicting change while moving in array', () => {
    const baseDoc = Automerge.from<{ items: string[] }>({
      items: ['a', 'b', 'c'],
    });

    const aliceDoc = Automerge.change(Automerge.clone(baseDoc), (doc) => {
      const id = doc.items.splice(2, 1);
      doc.items.splice(0, 0, ...id);
    });
    const bobDoc = Automerge.change(Automerge.clone(baseDoc), (doc) => {
      const id = doc.items.splice(2, 1);
      doc.items.splice(0, 0, ...id);
    });

    const result = Automerge.merge(Automerge.clone(aliceDoc), bobDoc);

    expect(Automerge.toJS(result)).toEqual({
      items: ['c', 'a', 'b'],
    });
  });
});
