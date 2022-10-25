# `@matrix-widget-toolkit/react`

[![@matrix-widget-toolkit/react](https://img.shields.io/npm/v/@matrix-widget-toolkit/react)](https://www.npmjs.com/package/@matrix-widget-toolkit/react)

This is package that provides a Widget API intergration for React apps.

## Usage

Install it with:

```bash
yarn add @matrix-widget-toolkit/react
```

### Providing the Widget API to React components

While this package contains a `<WidgetApiProvider>` you probably don't want to use this package most of the time.
Prefer using [`@matrix-widget-toolkit/mui`](../mui/) or [`@matrix-widget-toolkit/semantic-ui`](../semantic-ui/) which internally use this package to share functionality.

### Acessing the Widget API

Once the Widget API is provided to React components, use the `useWidgetApi` hook to access it:

```typescript
import { useWidgetApi } from '@matrix-widget-toolkit/react';

const widgetApi = useWidgetApi();
```

### Mocking the Widget API

Most of the time you will use `<MuiWidgetApiProvider>` to initialize and provide the `WidgetApi` to your react components.
However, if you want to mock it in tests, you can use `<WidgetApiMockProvider>` to provide a mocked version:

```tsx
import { WidgetApiMockProvider } from '@matrix-widget-toolkit/react';

<WidgetApiMockProvider value={widgetApi}>
  /* Your child components */
</WidgetApiMockProvider>;
```
