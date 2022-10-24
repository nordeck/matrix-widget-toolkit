# ADR004: Versioning and Release Notes for Matrix Widgets

> This decision does not apply to the `matrix-widget-toolkit` repository or other library packages.

Status: accepted

<!-- These documents have names that are short noun phrases. For example, "ADR001: Deployment on Ruby on Rails 3.0.10" or "ADR009: LDAP for Multitenant Integration" -->

## Context

<!--
This section describes the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such. The language in this section is value-neutral. It is simply describing facts. -->

Version numbers and changelogs are important properties of applications that are developed for other stakeholders.
Several internal and external processes need to trace changes across the application lifecycle.
Currently, our widgets are published with `0.1.0-<commit-sha>` versions.
But since the commit hashes are not in a lexicographic order, it's not straightforward to find out whether a version is newer than another or which changes did occur between two known version.
Especially since not everyone has access to the source code.
Our goal is that it is easy to see whether a deployed version is up-to-date or not.
We also want to provide a changelog that communicates what was changed between versions.

The contents of the changelog should focus on customer relevant changes:

1. Feature changes:
   Describe that a new feature was added compared to the last version.
2. Bug changes:
   Describe that a bug was fixed compared to the last version.

We don't want to clutter the changelog with unnecessary changes like dependency version updates if they don't fix security issues or have an impact on the shipped artifacts.

This process should generate artifacts (i.e. docker containers) with different versions for multiple uses:

1. A container for each commit (`my-image-name:<short-sha>`) that can be used in always-up-to-date dev deployments.
2. A container for each version (`my-image-name:<version>`) that can be used in production deployments.
3. A container for `latest` that is used to indicate which version is the most recent one.

## Decision

<!-- This section describes our response to these forces. It is stated in full sentences, with active voice. "We will ..." -->

We will use [`@changesets/cli`](https://github.com/changesets/changesets) to support our changelog and version generation.
Each relevant Pull Request will include a so called “changeset” that describes the type of change (`patch` or `minor`) and a description.
We will start with `1.0.0` when we deploy the widget to production for the first time.
We will implement a CI-assisted versioning process to convert changesets into version bumps and changelog updates.
We will not strictly follow semantic versioning for widgets and avoid major version bumps.

> Breaking changes in standalone widgets are not really relevant.
> In general, we expect all room-event schema changes to be forward and backward compatible.
> We don't consider UI changes or feature removals as breaking changes.

### Alternative

Manually maintain the `CHANGELOG.md` for the widgets, bump the version, and manually create the tags.
This is similar to how for example the [`matrix-widget-api` handles it](https://github.com/matrix-org/matrix-widget-api/blob/master/docs/releases.md).

## Consequences

<!-- This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future. -->

With the new tooling, a merged Pull Request without a changeset will not trigger a version bump.
This also means that dependabot PRs won't include changesets by default.
We must manually create them to have them included in a release if the change is relevant for the customer.

This is the process that we implement:

1. Every Pull Request that contains relevant changes compared to the last version must provide a “changeset” that describes the change.
   The changeset briefly describes the change so that users understand their impact.
   The changeset should also include important information about a change if applicable (examples: a new config flag, breaking changes that affect the deployment).
2. For every commit in `main`, a docker container will be pushed with the tag `<7-commit-hash>` to the registry.
3. The CI will create a “Version Packages” Pull Request that generates the changelog and the updates the version in the `package.json`.
4. Once the version PR is merged to `main`, the CI will create Git tags for the version.
5. Once the Git tag is created, the CI will promote the `<7-commit-hash>` image and publish it as `<version>` and `latest`.
   > Example:
   >
   > 1. Merge a Pull Request with merge commit id `2337b44be2a27133fb1b4e939cbe15d762e159a0`.
   > 2. &lt;ci-trigger-push-branch&gt; Build the application and publish container as `application-image-name:2337b44`.
   > 3. (If the version was updated) Create a Git tag `1.5.2`.
   > 4. &lt;ci-trigger-push-tag&gt; Pull the `application-image-name:2337b44` image and publish it with the following names: `application-image-name:1.5.2`, `application-image-name:latest`.

While setting up the project, we will create changeset with the initial release.
The CI will then create the git tag (and GitHub release) and push the container.

We will merge the “Version Packages” PR if we want to generate a new version update for the deployment.
This will happen after notable features or bugs are fixed of security updates need to be rolled out.

### Pre-releases

We won't add support for creating pre-releases of long living feature branches that might be used for larger architectural changes.
Our current plan would be to configure the CI to push `<short-sha>` tags of feature branches if needed.
There won't be an automated changelog generation in this case, but the PR could still already include the needed changesets.
With this in mind, we will also stop using different “environments” such as `nic/env/dev` and migrate all repositories to use the `main` branch.

### Examples Changelogs

This section lists some versioning examples.
It shows an excerpt on the timeline (which PRs were merged; which PR includes a changeset; when did we publish a release) and the resulting changelog entries.

#### Add a new feature

**Expectation:**
The feature is added to the changelog.

Timeline:

- Merge Commit `1441437`: Add a new feature `[has-changeset]`
- &lt;release&gt;

```md
## 1.1.0

### Minor Changes

- 1441437: Add a new feature
```

#### Add a new feature in multiple Pull Requests

**Expectation:**
The feature is added to the changelog as a single entry.
The incremental development is not represented in the changelog.

Timeline:

- Merge Commit `1441437`: Add a new feature I `[has-changeset]`
- Merge Commit `1441439`: Add a new feature II
- Merge Commit `1441436`: Add a new feature III
- &lt;release&gt;

```md
## 1.1.0

### Minor Changes

- 1441437: Add a new feature
```

#### Fix a bug

**Expectation:**
The bugfix is added to the changelog.

Timeline:

- Merge Commit `1441438`: Fix a bug `[has-changeset]`
- &lt;release&gt;

```md
## 1.0.1

### Patch Changes

- 1441438: Fix a bug
```

#### Fix a bug in a feature before releasing

**Expectation:**
The feature is added to the changelog as a single entry.
The bugfix is not represented in the changelog because it is not relevant for the consumers.

Timeline:

- Merge Commit `1441437`: Add a new feature `[has-changeset]`
- Merge Commit `1441438`: Fix a bug
- &lt;release&gt;

```md
## 1.1.0

### Minor Changes

- `1441437`: Add a new feature
```

#### Fix a bug in a feature after releasing

**Expectation:**
The feature is added to the changelog.
The bugfix is added to the changelog because the original feature was already released to the consumers.

Timeline:

- Merge Commit `1441437`: Add a new feature `[has-changeset]`
- &lt;release&gt;
- Merge Commit `1441438`: Fix a bug `[has-changeset]`
- &lt;release&gt;

```md
## 1.1.1

### Patch Changes

- 1441437: Fix a bug

## 1.1.0

### Minor Changes

- 1441438: Add a new feature
```

### How to setup changesets in a repository

1. Install Changesets

```bash
yarn add --dev @changesets/cli
yarn changeset init
```

2. Add to `README.md`:

```md
### Versioning

This package uses automated versioning.
Each change should be accompanied with a specification of the impact (`patch`, `minor`, or `major`) and a description of the change.
Use `yarn changeset` to generate a new changeset for a pull request.
Learn more in the [`.changeset` folder](./.changeset).

Once the change is merged to `main`, a “Version Packages” pull request will be created.
As soon as the project maintainers merged it, the package will be released and the container is published.
```

3. Add to `CONTRIBUTING.md` (if exists):

```md
### Versioning

We use [`changesets`](https://github.com/changesets/changesets) to help us prepare releases.
Each change should be accompanied with a specification of the impact (`patch`, `minor`, or `major`) and a description of the change.
Use `yarn changeset` to generate a new changeset for a pull request.
Learn more in the [`.changeset` folder](./.changeset).

Once your Pull Request has been merged to `main`, it will automatically considered in the next release.

For more information, checkout [“adding a changeset”](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md) in the changesets repository.
You can also find some reasoning on why we selected this approach in [the `matrix-widget-toolkit` repository](https://github.com/nordeck/matrix-widget-toolkit/blob/main/docs/adrs/adr004-versioning-and-release-notes.md).
```

4. Update the CI

```yaml
# .github/workflows/publish-release.yml

# This pipeline runs for every new tag. It will pull the docker container for
# the commit hash of the tag, and will publish it as `:<tag-name>` and `latest`.
name: Release Package

on:
  push:
    tags:
      - '*'

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      DOCKER_IMAGE: ghcr.io/nordeck/<github-repo-name>
    steps:
      - name: Generate Docker metadata of the existing image
        id: meta-existing-tag
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.DOCKER_IMAGE }}
          tags: |
            type=sha,prefix=

      - name: Generate Docker metadata of the new image
        id: meta-new-tags
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.DOCKER_IMAGE }}
          labels: |
            org.opencontainers.image.title=<your widget name>
            org.opencontainers.image.description=<your description>
            org.opencontainers.image.vendor=<your company>
          tags: |
            type=semver,pattern={{version}}

      - name: Generate Dockerfile
        env:
          SOURCE_IMAGE: ${{ fromJSON(steps.meta-existing-tag.outputs.json).tags[0] }}
        run: |
          echo "FROM $SOURCE_IMAGE" > Dockerfile

      - name: Login to ghcr.io
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.PACKAGE_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v3
        with:
          push: true
          context: .
          tags: ${{ steps.meta-new-tags.outputs.tags }}
          labels: ${{ steps.meta-new-tags.outputs.labels }}
```

```yaml
# ./github/workflows/ci.yaml

name: CI

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      DOCKER_IMAGE: ghcr.io/nordeck/<github-repo-name>
    outputs:
      docker-tag: ${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@v3
        with:
          # required for changesets
          fetch-depth: '0'
          # don't persist the credentials so the changesets action doesn't use the
          # github actions token but the git token provided via environment variable
          persist-credentials: false

      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'yarn'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@nordeck'

      - name: yarn install
        run: yarn install --frozen-lockfile
        env:
          NODE_AUTH_TOKEN: ${{ secrets.PACKAGE_TOKEN }}

      # ... check and build your widget ...

      - name: Login to ghcr.io
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.PACKAGE_TOKEN }}

      - name: Generate Docker metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.DOCKER_IMAGE }}
          labels: |
            org.opencontainers.image.title=<your widget name>
            org.opencontainers.image.description=<your description>
            org.opencontainers.image.vendor=<your company>
          tags: |
            type=sha,prefix=

      - name: Build and push
        uses: docker/build-push-action@v3
        with:
          push: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}
          context: .
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

      - name: Create Release Pull Request or Publish Packages
        if: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}
        uses: changesets/action@ce079ea084e08a340947ed4d6ecedb2433c8f293
        with:
          publish: yarn changeset tag
        env:
          GITHUB_TOKEN: ${{ secrets.CHANGESETS_GITHUB_TOKEN }}
```

6. Remove all labels from the `Dockerfile`.

7. Push the branch, merge it to `main`. The version `0.1.0` should be released.

8. Create the first changeset:

```bash
# select `major`; text: `Initial release`
yarn changeset
```

9. Merge the changeset, wait for the “Version Packages” PR, and merge it. Version `1.0.0` will be released.

<!-- This template is taken from a blog post by Michael Nygard http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions -->
