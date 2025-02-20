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
Prefer using [`@matrix-widget-toolkit/mui`](../mui/) which internally uses this package to share functionality.

### Customizing Widget Registration

You can customise the Widget registration with a name and type. This will be used to show the widget name in the
`Extensions` page of Element Web:

```typescript
<WidgetApiProvider
  widgetApiPromise={widgetApiPromise}
  widgetRegistration={{
    name: 'Example Widget',
    type: 'com.example.clock',
    data: { title: 'Learn more…' },
  }}
>
```

### Checking for specific Widget Parameters

Widgets must be registered within the room state with a set of parameters that the hosting client will provide,
such as the `matrix_user_id`, `matrix_room_id` and others that are essential for the Widget to operate under
the correct context.

As new parameters have been introduced and exposed in the Widget API and hosting clients, by default they will
not be checked during registration and might not be available for the widget to use.

To check for specific parameters and require a re-registration of the widget if they are absent, you can create
the provider component with a list of required `WidgetParameter`'s:

```typescript
<WidgetApiProvider
  widgetApiPromise={widgetApiPromise}
  widgetRegistration={{
    name: 'Example Widget',
    type: 'com.example.clock',
    data: { title: 'Learn more…' },
    // Device ID must be available upon registration
    requiredParameters: [WidgetParameter.DeviceId],
  }}
>
```

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
