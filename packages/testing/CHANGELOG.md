# `@matrix-widget-toolkit/testing`

## 2.2.1

### Patch Changes

- 5534372: Explain the default values of the parameters of `mockWidgetApi` in the docs.

## 2.2.0

### Minor Changes

- 704e6aa: Implement sending and receiving of _to device_ messages.
- 84f4e88: Expose turn servers in the widget API.

### Patch Changes

- Updated dependencies [704e6aa]
- Updated dependencies [84f4e88]
  - @matrix-widget-toolkit/api@3.1.0

## 2.1.0

### Minor Changes

- 7759822: Support a type filter for `clearRoomEvents()`.

### Patch Changes

- Updated dependencies [df0fef9]
  - @matrix-widget-toolkit/api@3.0.0

## 2.0.0

### Major Changes

- aa806cf: Remove `originalEvent` from `readEventRelations`.

  This field was removed by the matrix-widget-api.

### Patch Changes

- 6584d71: Support the `direction` option when reading event relations.

  This also changes the default behavior of the `MockWidgetApi` that returned the events in the wrong order when no direction is provided.

- 31f2441: Reject returning event relations when the referenced event doesn't exist.
- Updated dependencies [aa806cf]
- Updated dependencies [6584d71]
  - @matrix-widget-toolkit/api@2.0.0

## 1.0.1

Initial release
