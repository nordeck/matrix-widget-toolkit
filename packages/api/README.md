# `@matrix-widget-toolkit/api`

[![@matrix-widget-toolkit/api](https://img.shields.io/npm/v/@matrix-widget-toolkit/api)](https://www.npmjs.com/package/@matrix-widget-toolkit/api)

This is package that wraps `matrix-widget-api` to provide a more convenient API.
For now, the API includes:

- A `WidgetApi` interface with more advanced features.
- Helper functions for registering the Widget in rooms.
- Types and helper functions for common events, like power levels, room members, redactions, and relations.

## Usage

Install it with:

```bash
yarn add @matrix-widget-toolkit/api
```

### Creating a `WidgetApi` instance

Creating the `WidgetApi` instance should be done as early as possible in your code because otherwise the widget misses the connection establishment by the widget host (especially on Safari).

```typescript
import { WidgetApiImpl } from '@matrix-widget-toolkit/api';

const widgetApi = await WidgetApiImpl.create();
```

### Request capabilities

You can request additional capabilities at any time using `requestCapabilities()`.
A call returns a promise that resolves once the user approved the capabilities.

```typescript
import { WidgetEventCapability } from 'matrix-widget-api';

await widgetApi.requestCapabilities([
  WidgetEventCapability.forStateEvent(
    EventDirection.Send,
    STATE_EVENT_POWER_LEVELS,
  ),
]);
```

### Receiving state events

You can read state events once from the current room using `receiveStateEvents()`:

```typescript
const events = await widgetApi.receiveStateEvents(STATE_EVENT_ROOM_NAME);

// events is an array of state events
```

> **Warning** Don't assume the type of the returned events, always validate that they have the expected schema.

### Observing state event changes

You can listen to state event changes using `observeStateEvents()`.
Note that the initial state is also returned.

```typescript
const subscription = widgetApi
  .observeStateEvents(STATE_EVENT_POWER_LEVELS)
  .subscribe(async (event) => {
    // The callback is always called if a state event changes
  });

// Don't forget to unsubscribe later
subscription.unsubscribe();
```

### Sending state events

You can send state events using `sendStateEvent()`.
It returns a promise that resolves once the event has been sent.

```typescript
await widgetApi.sendStateEvent('m.room.topic', {
  topic: 'A brief description',
});
```

> **Warning** Avoid sending event content that has no changes, as the returned promise doesn't resolve in this case.

### Receiving room events

You can read the current room events using `receiveRoomEvents()`.
Note that this API only returns the events that are currently in the view of the client.
There is no guarantees to read all events from the room.
Therefore this function is of limited use.
For more details and solutions, see [MSC3869](https://github.com/nordeck/matrix-spec-proposals/blob/nic/feat/widgetapi-read-relations/proposals/3869-widgetapi-read-event-relations.md).

```typescript
const events = await widgetApi.receiveRoomEvents('com.example.test');

// events is an array of room events
```

### Observing room events

You can listen to room events using `observeRoomEvents()`.

```typescript
const subscription = widgetApi
  .observeRoomEvents(ROOM_EVENT_REACTION)
  .subscribe(async (event) => {
    // Callback is called every time a room event is received
  });

// Don't forget to unsubscribe later
subscription.unsubscribe();
```

### Sending room events

You can send room events using `sendRoomEvent()`.
It returns a promise that resolves once the event has been sent.

```typescript
await widgetApi.sendRoomEvent('m.room.redaction', {
  redacts: '$event-id',
});
```

### Read related events

You can use `readEventRelations()` to read events releated to an event via `m.relates_to`.
It provides an API with cursors that you can use to page through the results.

```typescript
const result = await widgetApi.readEventRelations(eventId, {
  limit: 50,
  from,
  relationType: 'm.annotation',
  eventType: 'm.reaction',
});

// result contains the events and cursor for paging further though the events
```

### Opening Modal Widgets

You can open modal widgets using `openModal()`.
It returns a promise that resolves with the result of the modal.

Inside the modal widget, you can use `observeModalButtons()` to listen to clicks on the bottom buttons of the modal.
You can use `setModalButtonEnabled()` to disable buttons from within the widget.
Once you are done, you can call `closeModal()` to close the modal and pass the results back to the main widget.

### Delayed events

You can send and update delayed events (MSC4140). The configuration for delayed events on the homeserver
needs to be applied, for example:

```
max_event_delay_duration: 24h
```
