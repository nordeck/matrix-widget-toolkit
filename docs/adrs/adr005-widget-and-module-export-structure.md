# ADR005: Widget and Module Export structure

Status: accepted

<!-- These documents have names that are short noun phrases. For example, "ADR001: Deployment on Ruby on Rails 3.0.10" or "ADR009: LDAP for Multi tenant Integration" -->

## Context

<!--
This section describes the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such. The language in this section is value-neutral. It is simply describing facts. -->

We create widgets that extend the [Element messenger](https://element.io).
They use a number of APIs to interact with the host messenger applications.
The widgets consume the `matrix-widget-toolkit` for common building blocks such as API access, error handling, and theming.
The widgets are developed with the React framework in TypeScript.

Each widget should follow a clear and common structure to strive for a high quality and to make it easily understandable for other developers (code is more often read than written).
This also becomes relevant since some widgets are planned to be open sourced.

## Decision

<!-- This section describes our response to these forces. It is stated in full sentences, with active voice. "We will ..." -->

We will apply the following rules to each existing and upcoming widget development project:

1. There is a separation between _feature components_ and _reusable components_, and internal _helper components_.
2. Components and helpers that belong together, should be stored in the same folder—this also includes (unit) tests.
3. A folder should make selected components available to others by explicitly exporting a _public API_.
4. Hierarchical folders can re-export children to compose a larger public API.

### File and Folder Structure

The `src/` folder of each project contains a single `components/` folder that includes all React components.
There can optionally be helper directories such as `lib/` to store non-components or non-business functionality.

Some basic principles:

1. Create well-scoped small components (that are easily testable).
2. Create small components and compose them into larger ones.
3. Select meaningful names for all helpers and components (ex: `<NameList/>` instead of `<Component2/>`).
4. Store each component in a folder of the same name (ex: `<Component/>` in `src/components/Component/Component.tsx`).
5. Store sub-components and helpers in the same folder (ex: `<SubComponent/>` in `src/components/Component/SubComponent.tsx`).
6. Store test files as `<component>.test.tsx` alongside the tested component (ex: `src/components/Component/Component.test.tsx`).

This is a resulting example folder structure:

```
src/
 ├─index.ts[x]
 ├─components/
 │  ├─index.ts
 │  ├─ComponentX/
 │  │  ├─index.ts
 │  │  ├─ComponentX.tsx
 │  │  ├─ComponentX.test.tsx
 │  │  ├─SubComponentY.tsx
 │  │  ├─SubComponentY.test.tsx
 │  └─ComponentY/
 │     ├─index.ts
 │     ├─ComponentY.tsx
 │     ├─ComponentY.test.tsx
 │     ├─SubComponentZ.tsx
 │     ├─SubComponentZ.test.tsx
 └─lib/
    ├─index.ts
    └─UtilityX/
       ├─index.ts
       ├─UtilityX.tsx
       ├─UtilityX.test.tsx
       ├─helper.tsx
       └─helper.test.tsx
```

### Export Structure

We will use an export scheme that only exports public elements.
All of the above mentioned folders contain an `index.ts` that explicitly (re-)exports components and helpers for external use.

> Some basic rules for exporting:
>
> 1. Export from a file to access it in tests.
> 2. Export from a folder to access it from other components.
> 3. Don't do `default` exports (one reason is consistent naming, [learn about more reasons](https://humanwhocodes.com/blog/2019/01/stop-using-default-exports-javascript-module/)).
> 4. Export all types and interfaces that a consumer might need.

We will only import from the public API.
We will use the highest exporting module relative to the importing file.

> Some basic import rules:
>
> 1. Never import from `.` or `..` to not import yourself again.
> 2. Always import components from the same folder with `./<component>.tsx`.
> 3. Always import components from a different folder with `../<component-folder>`—choose the “top-most” export.

These rules apply to `widget` projects as well as to `library` projects.
The main difference is that a `library` has a top-level `index.ts` that exports its public API while a `widget` has an `index.tsx` as the application entrypoint.

Some additional guidelines:

1. Index files that are re-exporting symbols from non-index files should always enumerate all exports:

   ```ts
   // in components/ComponentX/index.ts
   export { ComponentX } from './ComponentX';
   export type { ComponentXProps } from './ComponentX';
   ```

2. Index files that are re-exporting other index files should always use the wildcard form:

   ```ts
   // in components/index.ts
   export * from './ComponentX';
   ```

3. Internal cross-directory imports are allowed from non-index modules to index modules:

   ```ts
   // in components/ComponentX/ComponentX.tsx
   import { UtilityX } from '../../lib/UtilityX';
   ```

4. Imports that bypass an index file are _discouraged_, but may sometimes be necessary:
   ```ts
   // in components/ComponentX/ComponentX.tsx
   import { helperFunc } from '../../lib/UtilityX/helper';
   ```

## Consequences

<!-- This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future. -->

We will refactor the existing widgets to follow this schema as good as possible.
We will enforce these rules for any new widget that will be created.

<!-- This template is taken from a blog post by Michael Nygard http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions -->
