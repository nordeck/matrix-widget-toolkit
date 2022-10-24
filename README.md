# Matrix Widget Toolkit

[![CI](https://github.com/nordeck/matrix-widget-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/nordeck/matrix-widget-toolkit/actions/workflows/ci.yml)

Reusable framework for creating Matrix widgets.

This repository contains multiple [packages](./packages) that provide reusable components that can be used to write Matrix/Element widgets.

- [`@matrix-widget-toolkit/api`](./packages/api): A package that wraps [`matrix-widget-api`](https://github.com/matrix-org/matrix-widget-api) to provide a more convenient API.
- [`@matrix-widget-toolkit/react`](./packages/react): A package that provides a Widget API integration for React apps.
- [`@matrix-widget-toolkit/semantic-ui`](./packages/semantic-ui): A package that provides a matching Semantic UI theme for Element.
- [`@matrix-widget-toolkit/mui`](./packages/mui): A package that provides a matching Mui theme for Element.
- [`@matrix-widget-toolkit/testing`](./packages/testing): Testing support for `@matrix-widget-toolkit/api`.
- [`@matrix-widget-toolkit/widget-server`](./containers/widget-server): A container to host a Matrix widget in a production environment.
- More packages to follow…

## Background

Nordeck is developing multiple widgets that are all based on the [`matrix-widget-api`](https://github.com/matrix-org/matrix-widget-api).
This collection of packages shares the common parts of our widgets:

- Advanced patterns using the `matrix-widget-api`, providing an API that better fits our use cases.
- Integrating it into React applications.
- Provide a common theming that integrates well with Element (the only Matrix client that supports the `matrix-widget-api` up to now).
- Testing support

## Getting Started

This repository contains an [example widget](./widget-example-mui) that shows the usage of the packages.

### How to contribute

Please take a look at our [Contribution Guidelines](https://github.com/nordeck/.github/blob/main/docs/CONTRIBUTING.md).
Check the following steps to develop for the packages:

#### Requirements

You need to install Node.js (>= 16.0.0, prefer using an LTS version) and run
`yarn` to work on this package.

#### Installation

After checkout, run `yarn install` to download the required dependencies

> **Warning** Do not use `npm install` when working with this package.

#### Available Scripts

The following commands are available:

- `yarn start:example`: Start the example app.
- `yarn build`: Build all packages and the example app.
- `yarn test`: Watch all packages for changes and run tests.
- `yarn tsc`: Check TypeScript types for errors in all packages.
- `yarn lint`: Run eslint on all packages.
- `yarn prettier:write`: Run prettier on all files to format them.
- `yarn depcheck`: Check all packages for missing or unused dependencies.
- `yarn deduplicate`: Deduplicate dependencies in the `yarn.lock` file.
- `yarn changeset`: Generate a changeset that provides a description of a
  change.
- `yarn translate`: Update translation files from code.
- `yarn generate-api-report`: Every time you change the public API interface,
  you have to update the `api-report.md` of the related package using this
  script. The API report provides an overview about the exported elements of
  the package.
- `yarn tunnel`: Start a service based on [localtunnel](https://github.com/localtunnel/localtunnel)
  that provides your widget publicly under a HTTPS secured domain. The URL is
  printed to the console. Run this command together with `yarn start:example`.
  This can be used to share the widget with others, or to try the widget in
  Element without having to run Chrome with unsecure flags. That way Chrome
  behaves closer to how it would behave in production.

#### Versioning

All packages use automated versioning.
Each change should be accompanied with a specification of the impact (`patch`, `minor`, or `major`) and a description of the change.
Use `yarn changeset` to generate a new changeset for the project you touch in a pull request.
Learn more in the [`.changeset` folder](./.changeset).

Once the change is merged to `main`, a "Version Packages" pull request will be created.
As soon as that is merged, the packages will be released to the package registry.

#### Processing Dependabot PRs

Dependabot PRs which update packages that are direct dependencies of our packages (and not `devDependencies` or only a dependency of the example widget) need a changeset as described above.
Specify the impact as `patch`.

#### Architecture Decision Records

We use [Architecture Decision Records (ADR)s](./docs/adr/adr001-use-adrs-to-document-decisions.md) to document decisions for our software.
You can find them at [`/docs/adrs`](./docs/adrs/).

## License

This project is licensed under the [Apache 2.0 license](./LICENSE).
