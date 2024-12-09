# `@matrix-widget-toolkit/testing`

## 3.0.3

### Patch Changes

- Updated dependencies [76314a9]
- Updated dependencies [14f1795]
  - @matrix-widget-toolkit/api@4.0.0

## 3.0.2

### Patch Changes

- 9486231: Remove usage of lodash

## 3.0.1

### Patch Changes

- 55d42f1: Fix the esm exports and lodash exports
- Updated dependencies [55d42f1]
  - @matrix-widget-toolkit/api@3.4.2

## 3.0.0

### Major Changes

- f00e7cf: Migrate to vitest for testing. We do not support jest any further

### Patch Changes

- Updated dependencies [f00e7cf]
  - @matrix-widget-toolkit/api@3.4.1

## 2.5.0

### Minor Changes

- 9a54c89: Add support for mocking the download_file widget action

## 2.4.0

### Minor Changes

- d4cef99: Implement upload files into media repository.

### Patch Changes

- Updated dependencies [d4cef99]
  - @matrix-widget-toolkit/api@3.3.0

## 2.3.2

### Patch Changes

- cabc33d: Switched Node.js version to 20. We encourage all consuming projects to also switch to this version.
- Updated dependencies [cabc33d]
  - @matrix-widget-toolkit/api@3.2.2

## 2.3.1

### Patch Changes

- cd3d072: Bump `rxjs` 7.8.0 to 7.8.1.
- Updated dependencies [cd3d072]
- Updated dependencies [f65e688]
  - @matrix-widget-toolkit/api@3.2.1

## 2.3.0

### Minor Changes

- a021ec7: Implement searching the user directory.

### Patch Changes

- a021ec7: Bump `matrix-widget-api` from 1.1.1 to 1.3.1.
- Updated dependencies [a021ec7]
- Updated dependencies [a021ec7]
  - @matrix-widget-toolkit/api@3.2.0

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
