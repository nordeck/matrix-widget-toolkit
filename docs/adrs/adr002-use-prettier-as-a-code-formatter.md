# ADR002: Use Prettier as a Code Formatter

Status: accepted

<!-- These documents have names that are short noun phrases. For example, "ADR001: Deployment on Ruby on Rails 3.0.10" or "ADR009: LDAP for Multitenant Integration" -->

## Context

<!--
This section describes the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such. The language in this section is value-neutral. It is simply describing facts. -->

Source code should be optimized for readability, since code is more often read than written.
A consistent code style makes it easier to spot bugs or to get familiar with a new project.
Tool-supported formatters enforce a style and are widely used in different open source project (ex: [React](https://github.com/facebook/react/blob/main/.prettierrc.js) or [Nest](https://github.com/nestjs/nest/blob/master/.prettierrc)).

We already use ESLint to enforce a basic code format.
However, it is a linter that has less features than a dedicated formatting tool (ex: prettier).

> In other words, use Prettier for formatting and linters for catching bugs!
>
> — [Prettier vs. Linters](https://prettier.io/docs/en/comparison.html)

We want to use the same code formatting guidelines and the same formatting tools in all our projects.

## Decision

<!-- This section describes our response to these forces. It is stated in full sentences, with active voice. "We will ..." -->

We will use [Prettier](https://prettier.io/) as our formatter.
We will use the default code style where possible.
We will run `prettier --check` in the CI pipeline to enforce the style.

### Prettier

We will use the following settings that differ from the defaults:

```yaml
# .prettierrc.yaml

# Use single quotes instead of double quotes.
# (this will not affect JSX)
singleQuote: true
```

We will activate the following prettier plugins:

- [`prettier-plugin-organize-imports`](https://www.npmjs.com/package/prettier-plugin-organize-imports): Automatically organize all imports on format.

### ESLint

We will use the [`eslint-config-prettier`](https://www.npmjs.com/package/eslint-config-prettier) plugin to disable all eslint rules that conflict with prettier.

### Pre-Commit Hooks

We recommend to use [`husky`](https://www.npmjs.com/package/husky) and [`lint-staged`](https://www.npmjs.com/package/lint-staged) to format code during a commit.

See the [`.husky/`](../../.husky/) folder and the [`package.json`](../../package.json) of this project as an example.

### CI Pipeline

The CI pipeline should check the formatting.

## Consequences

<!-- This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future. -->

We setup prettier in all existing widget repositories and reformat the code.

### Setup the Code Style in a Repository

1. `yarn add --dev prettier husky lint-staged prettier-plugin-organize-imports eslint-config-prettier`

2. Add `"prettier"` as the last entry of the `"extends"` list to the `.eslintrc`:

   ```json
   {
     "extends": [
       // ...
       "prettier"
     ]
     // ...
   }
   ```

3. Update the content of the `.husky/pre-commit` file to be:

   ```sh
   #!/bin/sh
   . "$(dirname "$0")/_/husky.sh"


   node ./node_modules/lint-staged/bin/lint-staged.js
   ```

   > If there is no `.husky` folder in your repository, run the following command:
   > `yarn husky install && yarn husky add .husky/pre-commit "node ./node_modules/lint-staged/bin/lint-staged.js"`

4. Create a `.prettierignore` file:

   ```ignore
   # These folders will be skipped by prettier

   # Ignore artifacts
   build/
   coverage/
   ```

   > If you have more artifact folders (ex: `lib/`) add them to this file.

5. Create a `.prettierrc.yaml` file:

   ```yaml
   # .prettierrc.yaml

   # Use single quotes instead of double quotes.
   # (this will not affect JSX)
   singleQuote: true
   ```

6. Add two new scripts fo the `package.json`:
   ```json
   {
     // ...
     "scripts": {
       // ...
       "prettier:check": "prettier --check .",
       "prettier:write": "prettier --write ."
     }
   }
   ```
7. Add a `lint-staged: {...}` configuration to the `package.json`:

   ```json
   {
     // ...
     "lint-staged": {
       "*.{js,jsx,ts,tsx}": [
         "yarn eslint",
         "bash -c \"yarn tsc --pretty\"",
         "prettier --write"
       ],
       "*.{yaml,yml,json,md}": ["prettier --write"]
     }
   }
   ```

8. Run `yarn eslint-config-prettier src/index.tsx` and delete all unneeded rules from `.eslintrc`.

9. Run `yarn prettier:check` in the CI pipeline:

   ```yaml
   - name: prettier:check
     run: yarn prettier:check
   ```

10. ❗ Create a commit with the project setup.

11. Run `yarn prettier:write`

12. ❗ Create a commit with the reformatted files.

### Use Prettier in your IDE

There are prettier integrations for different IDEs such as VS Code or IntelliJ/WebStorm.
Learn more at [Editor Integration](https://prettier.io/docs/en/editors.html).

<!-- This template is taken from a blog post by Michael Nygard http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions -->
