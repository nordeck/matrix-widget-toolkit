# `@matrix-widget-toolkit/mui`

[![@matrix-widget-toolkit/mui](https://img.shields.io/npm/v/@matrix-widget-toolkit/mui)](https://www.npmjs.com/package/@matrix-widget-toolkit/mui)

This package provides a [Mui](https://mui.com/) theme that fits to the default Element theme.
It provides:

- Themes that match Element Web (the only Matrix Client that supports the `matrix-widget-api` right now)
- A light, dark, and high-contract mode
- Adjustments to fulfill accessibility standards

## Usage

Install it with:

```bash
yarn add @matrix-widget-toolkit/mui @mui/material
```

### Providing the Widget API to components

Now you can use it in your application:

```tsx
import { WidgetApiImpl } from '@matrix-widget-toolkit/api';
import {
  MuiThemeProvider,
  MuiWidgetApiProvider,
} from '@matrix-widget-toolkit/mui';
import { Button } from '@mui/material';

// Initiate the widget API on startup. The Client will initiate
// the connection with `capabilities` and we need to make sure
// that the message doesn't get lost while we are initiating React.
const widgetApiPromise = WidgetApiImpl.create();

function App() {
  return (
    <MuiThemeProvider>
      <MuiWidgetApiProvider widgetApiPromise={widgetApiPromise}>
        <Button>A styled button</Button>
      </MuiWidgetApiProvider>
    </MuiThemeProvider>
  );
}

export default App;
```

### Setup i18n

The `matrix-widget-toolkit` uses [`i18next`](https://www.i18next.com/) to provide translations for messages.
To make it work in your widget you have to initialize it on your end.
See the [`i18next` getting started documentation](https://www.i18next.com/overview/getting-started).
This package provides a `WidgetToolkitI18nBackend` containing the translation data.
You can use the [`ChainedBackend` plugin](https://github.com/i18next/i18next-chained-backend) to load translation data for the `matrix-widget-toolkit` together the translation data for the widget itself.
The package provides a `WidgetApiLanguageDetector` that detects the language from the widget parameters with the [`i18next-browser-languagedetector` plugin](https://github.com/i18next/i18next-browser-languageDetector).
For more details, see the implementation in the [example widget](../../example-widget-mui/src/i18n.tsx).

### Requesting capabilities on demand

You can hide child components till the user has approved all required capabilities:

```tsx
import { MuiCapabilitiesGuard } from '@matrix-widget-toolkit/mui';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';

<MuiCapabilitiesGuard
  capabilities={[
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      STATE_EVENT_ROOM_NAME
    ),
  ]}
>
  /* Children are only displayed once the user has approved all capabilities. */
</MuiCapabilitiesGuard>;
```

## Customization

You can override the primary color by setting the `REACT_APP_PRIMARY_COLOR` environment variable.

> **Warning** Choosing a different primary color might result in not meeting contrast requirements for accessability.

You can force the high contrast theme by setting the `REACT_APP_FORCE_HIGH_CONTRAST_THEME` environment variable.
