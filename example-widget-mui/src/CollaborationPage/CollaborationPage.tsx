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
import { MuiCapabilitiesGuard } from '@matrix-widget-toolkit/mui';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { throttle } from 'lodash';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import {
  DispatchWithoutAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { NavigationBar } from '../NavigationPage';
import { generateInitSchemaChange } from './migrations';
import { CollaborativeDoc, ROOM_EVENT_DOC } from './types';

console.log('test');

function arrayBufferToBase64(bytes: Uint8Array): string {
  var binary = '';
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

export default function CollaborationPage() {
  return (
    <>
      <NavigationBar title="Collaboration" />

      <MuiCapabilitiesGuard
        capabilities={[
          WidgetEventCapability.forRoomEvent(
            EventDirection.Receive,
            ROOM_EVENT_DOC
          ),
          WidgetEventCapability.forRoomEvent(
            EventDirection.Send,
            ROOM_EVENT_DOC
          ),
        ]}
      >
        <Editor />
      </MuiCapabilitiesGuard>
    </>
  );
}

const [initialDoc] = Automerge.applyChanges(
  Automerge.init<CollaborativeDoc>(),
  [generateInitSchemaChange()]
);

console.log('\\initialDoc', Automerge.getHeads(initialDoc));

const bc = new BroadcastChannel('test_channel');

function useEditor(): [state: CollaborativeDoc, action: DispatchWithoutAction] {
  const widgetApi = useWidgetApi();
  const docRef = useRef<Automerge.Doc<CollaborativeDoc>>(initialDoc);
  const [doc, setDoc] = useState<CollaborativeDoc>(docRef.current);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const boardcastDoc = useCallback(
    throttle(() => {
      const doc = docRef.current;
      const event = {
        blob: arrayBufferToBase64(Automerge.save(doc)),
      };
      console.log('\\boardcastDoc', Automerge.getHeads(doc));

      widgetApi.sendRoomEvent(ROOM_EVENT_DOC, event);
    }, 5_000),
    [widgetApi]
  );

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      console.log('\\delta', event.data);

      const changes = event.data;
      const doc = docRef.current;
      try {
        const [appliedDoc] = Automerge.applyChanges(doc, [changes]);
        docRef.current = appliedDoc;
        setDoc(docRef.current);
      } catch (ex) {
        console.error('\\error delta', ex);
      }
    };

    bc.addEventListener('message', listener);

    return () => bc.removeEventListener('message', listener);
  });

  useEffect(() => {
    const subscription = widgetApi
      .observeRoomEvents<{ blob: string }>(ROOM_EVENT_DOC)
      .subscribe((e) => {
        const base64 = e.content.blob;
        const loadedDoc = Automerge.load<CollaborativeDoc>(
          base64ToArrayBuffer(base64)
        );

        const doc = docRef.current;

        try {
          const mergedDoc = Automerge.merge(Automerge.clone(doc), loadedDoc);
          docRef.current = mergedDoc;
          setDoc(docRef.current);

          console.log(
            '\\event',
            Automerge.getChanges(loadedDoc, mergedDoc).length > 0,
            Automerge.getHeads(loadedDoc),
            Automerge.getHeads(doc)
          );

          console.log('\\history', Automerge.getHistory(mergedDoc));

          if (Automerge.getChanges(loadedDoc, mergedDoc).length > 0) {
            console.log('\\has changes');
            boardcastDoc();
          }
        } catch (ex) {
          console.error('\\error event', ex);
        }
      });

    return () => subscription.unsubscribe();
  }, [boardcastDoc, widgetApi]);

  const action = useCallback(() => {
    const doc = docRef.current;
    const changedDoc = Automerge.change(doc, (doc) => {
      (doc.count as unknown as { increment: () => void }).increment();
      doc.text.insertAt(0, ...doc.count.toString().split(''), ' ');
    });
    const changes = Automerge.getLastLocalChange(changedDoc);

    console.log(
      '\\action',
      Automerge.getHeads(changedDoc),
      Automerge.dump(changedDoc)
    );

    bc.postMessage(changes);

    docRef.current = changedDoc;
    setDoc(docRef.current);
    boardcastDoc();
  }, [boardcastDoc]);

  return [doc, action];
}

export function Editor() {
  const [doc, action] = useEditor();

  console.log('\\state', doc);

  const handleClick = useCallback(() => {
    action();
  }, [action]);

  return (
    <div>
      Hello World!
      <button onClick={handleClick}>Test</button>
      <textarea rows={10} cols={100} value={doc.text.toString()} />
      {doc.count.toString()}
    </div>
  );
}
