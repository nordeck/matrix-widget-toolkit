# `@matrix-widget-toolkit/testing`

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
