# `@matrix-widget-toolkit/testing`

[![@matrix-widget-toolkit/testing](https://img.shields.io/npm/v/@matrix-widget-toolkit/testing)](https://www.npmjs.com/package/@matrix-widget-toolkit/testing)

Testing support for `@matrix-widget-toolkit/api`.

## Usage

When testing widgets that are using `@matrix-widget-toolkit/api` you quickly run
into the situation where you have to mock `WidgetApi`. While this can be done
using `vitest`, this can be a lot of repeated work and you might miss edge cases
that makes the mock behave differently than the original. The package provides
a `mockWidgetApi` helper to cover this case. The returned mock can be used to
emulate a Widget host like Element, so that the widget can interact with the
Matrix room, like sending and receiving events.

Install it with:

```bash
yarn add @matrix-widget-toolkit/testing
```

### Setup

It's recommended to use a fresh mock instance in every test. After each test,
make sure to stop the mock by calling `stop()` to free resources:

```typescript
import { MockedWidgetApi, mockWidgetApi } from '@matrix-widget-toolkit/testing';

let widgetApi: MockedWidgetApi;

afterEach(() => widgetApi.stop());

beforeEach(() => (widgetApi = mockWidgetApi()));
```

### Simple Event Mock

In test, you can use the mock to prepopulate the current Matrix room with
events:

```typescript
// Prepopulate the power levels event in the room:
widgetApi.mockSendStateEvent({
  type: 'm.room.power_levels',
  sender: '@user-id',
  content: {
    users: {
      '@my-user': 100,
    },
  },
  state_key: '',
  origin_server_ts: 0,
  event_id: '$event-id-0',
  room_id: '!room-id',
});

// You can receive it using any of the methods of the widget api:
const powerLevels = widgetApi.receiveSingleStateEvent('m.room.power_levels');
```

### Verifying Sending of Events

As the methods of the mock are using `vi.fn()`, you can verify all of them:

```typescript
// In your code, send an event:
widgetApi.sendStateEvent(
  'm.room.topic',
  { topic: 'A brief description' },
  { roomId: '!my-room' },
);

// Verify that the event was send in your test:
expect(widgetApi.sendStateEvent).toBeCalledWith(
  'm.room.topic',
  { topic: 'A brief description' },
  { roomId: '!my-room' },
);
```

### Overriding Behavior

As the methods of the mock are using `vi.fn()`, you can change their default
behavior by mocking them:

```typescript
// Returns true by default, override to return false:
widgetApi.hasCapabilities.mockReturnValue(false);
```
