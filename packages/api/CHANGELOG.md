# `@matrix-widget-toolkit/api`

## 3.3.2

### Patch Changes

- fac0c61: Bump qs from 6.12.2 to 6.12.3

## 3.3.1

### Patch Changes

- efad054: Adds support for the matrix_base_url widget parameter required for translating mxc to http urls for uploaded files"

## 3.3.0

### Minor Changes

- d4cef99: Implement upload files into media repository.

## 3.2.2

### Patch Changes

- cabc33d: Switched Node.js version to 20. We encourage all consuming projects to also switch to this version.

## 3.2.1

### Patch Changes

- cd3d072: Bump `rxjs` 7.8.0 to 7.8.1.
- f65e688: Bump `qs` 6.11.0 to 6.11.2.

## 3.2.0

### Minor Changes

- a021ec7: Implement searching the user directory.

### Patch Changes

- a021ec7: Bump `matrix-widget-api` from 1.1.1 to 1.3.1.

## 3.1.0

### Minor Changes

- 704e6aa: Implement sending and receiving of _to device_ messages.
- 84f4e88: Expose turn servers in the widget API.

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
