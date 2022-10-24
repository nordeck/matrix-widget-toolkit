# `@matrix-widget-toolkit/semantic-ui`

This package provides a Semantic UI theme that fits to the default Element theme.
See [`matrix-example-widget-semantic-ui`](../../matrix-example-widget-semantic-ui/) for some examples.

> **Warning** This package is deprecated. We are about to migrate all our packages to use Material UI in the future.

## Usage

This package should be used with a [CRACO](https://www.npmjs.com/package/@craco/craco) project.

Install it with:

```bash
yarn add @matrix-widget-toolkit/semantic-ui semantic-ui-react
yarn add --dev @semantic-ui-react/craco-less
```

Register the plugin in your `craco.config.js`:

```js
module.exports = {
  plugins: [
    {
      plugin: require('@matrix-widget-toolkit/semantic-ui/craco/buildSemanticUiThemePlugin'),
    },
  ],
};
```

Add the following to your `package.json` so `jest` finds the virtual modules that are used inside of the package:

```json
  "jest": {
    "moduleNameMapper": {
      "semantic-ui-less/semantic.less(.+)": "semantic-ui-less/semantic.less"
    }
  }
```

Now you can use it in your application:

```tsx
import {
  SemanticUiThemeProvider,
  SemanticUiWidgetApiProvider,
} from '@matrix-widget-toolkit/semantic-ui';
import { Button } from 'semantic-ui-react';

function App() {
  return (
    <SemanticUiThemeProvider>
      <SemanticUiWidgetApiProvider>
        <Button primary>A styled button</Button>
      </SemanticUiWidgetApiProvider>
    </SemanticUiThemeProvider>
  );
}

export default App;
```

## Customization

You can override the primary color by setting the `REACT_APP_PRIMARY_COLOR` environment variable to a custom color during build.

## Update Font Awesome icons

The Font Awesome version coming with Semantic UI is to old and is missing icons.
Therefore this theme includes a newer set of icons.
To update the icons, use the following steps:

1. Use [`create-fomantic-icons`](https://github.com/fomantic/create-fomantic-icons) to download the newest stable version of fontawesome and generate the files needed by Semantic UI. Run `yarn create fomantic-icons` to generate the required files.
2. Modify `fui-icons/ui/src/themes/default/elements/icon.variables` and remove the `#icons` references from SVG font imports.
