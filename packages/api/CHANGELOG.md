# `@matrix-widget-toolkit/api`

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
