# `@matrix-widget-toolkit/api`

## 3.0.1

### Patch Changes

- 2dfbc7d: Fix a rare issue where `sendStateEvent` and `sendRoomEvent` return the wrong event.

## 3.0.0

### Major Changes

- df0fef9: Permit `null` values for the `displayname` and `avatar_url` fields in the `m.room.member` event.

## 2.0.0

### Major Changes

- aa806cf: Remove `originalEvent` from `readEventRelations`.

  This field was removed by the matrix-widget-api.

### Patch Changes

- 6584d71: Support the `direction` option when reading event relations.

  This also changes the default behavior of the `MockWidgetApi` that returned the events in the wrong order when no direction is provided.

## 1.0.2

### Patch Changes

- 4ba77c3: Don't return `null` values for the pagination token of the relations endpoint.

## 1.0.1

Initial release
