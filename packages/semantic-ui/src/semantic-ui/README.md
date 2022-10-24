# Themes

This folder contains different Semantic UI themes that are used by the `<SemanticUiThemeProvider />` component.
There are some overrides in the [`common`](./common) folder that are imported from each theme.

1. [`default`](./default): The default Semantic UI theme with a transparent background color. It is used when no other theme is selected and it loads the fonts.
2. [`light`](./light): A light theme for Element.
3. [`dark`](./dark): A light theme for Element.

Some variables in the themes and especially in the [`theme.config`](./theme.config) are provided by the [CRACO build plugin](./../../craco/buildSemanticUiThemePlugin.js).

## Theme Selection

The theme selection is based on the `<ThemeSelectionProvider />` component from the `@matrix-widget-toolkit/react` package.
The `light` and `dark` themes are scoped to a `.light` or `.dark` class on the `html` tag.
There is also a `.widgetModal` class that changes certain styles that only apply in modals (e.g. the background color).
