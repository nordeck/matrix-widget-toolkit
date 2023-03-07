# `@matrix-widget-toolkit/widget-server`

This is a container image to package a Matrix widget.

The container has the following features:

- Based on the official `nginx` image in the `alpine` variant.
- Prepared for Single Page Applications (including history API).
- Sane `Cache-Control` defaults.
- Sane `Content-Security-Policy` defaults.
- Injects a `NONCE` into the `index.html` file.
- Injects `REACT_APP_*` environment variables into the `index.html` file.
- Uses a non privileged user (`runAsNonRoot: true`).
- Supports read-only file systems (`docker run --read-only ...` or `readOnlyRootFilesystem: true`).
- Exposes the application on port `8080`.

## Usage

This container works best with widgets that are build in the latest Create React App (CRA) version (we recommend `>=5.0.0`).

### Preparations

1. Make sure your application doesn't rely on `unsafe-inline`.
   CRA provides the [`INLINE_RUNTIME_CHUNK=false` option](https://create-react-app.dev/docs/advanced-configuration/) to make it compatible with the environment.

2. Add `<!--#echo var="__INJECT_SCRIPT_TAG__" encoding="none"-->` before the `</head>` tag in your `index.html`:

   ```diff
   <html>
       <head>
       <!-- ... -->
   +     <!--#echo var="__INJECT_SCRIPT_TAG__" encoding="none"-->
       </head>
       <body>
       <!-- ... -->
       </body>
   </html>
   ```

3. Make sure that your build artifacts are in the `static/` folder of your build directory have a `hash` in its name. This is the default for CRA.

4. Create a new Dockerfile in your repository:

   ```Dockerfile
   # Use the latest version of the base image
   FROM ghcr.io/nordeck/matrix-widget-toolkit/widget-server:0

   ARG BUILD_DATE
   ARG VCS_REF
   ARG VERSION

   LABEL \
      org.opencontainers.image.created=$BUILD_DATE \
      org.opencontainers.image.title="<your widget name>" \
      org.opencontainers.image.description="<your description>" \
      org.opencontainers.image.url="https://github.com/<org>/<repo>" \
      org.opencontainers.image.revision=$VCS_REF \
      org.opencontainers.image.source="https://github.com/<org>/<repo>" \
      org.opencontainers.image.vendor="<your company>" \
      org.opencontainers.image.version=$VERSION

   # Add your build output to the `/usr/share/nginx/html/`.
   # This example assumes `build/`, but it can differ in your environment
   ADD build /usr/share/nginx/html/
   ```

### Build your image

1. Create a production build of your widget (`npm run build` / `yarn build` in CRA).

2. Build (`docker build .`).

   > The project CI should provide variables for `BUILD_DATE`, `VCS_REF` (=commit sha), and `VERSION` during build time.
   > Example: Export them as environment variables and call `docker build --build-arg BUILD_DATE --build-arg VCS_REF --build-arg VERSION .`

3. Run the image 🎉.

### Caching

The image uses the following caching strategy:

**Uniquely Named Files**:
All files that have a unique content hash in it's name (example: `[name].[contenthash].js`) should be located in the `static/` folder and are cached by the browser.

**Mutable Files**:
Files like `index.html`, `manifest.json`, or translation files will change on every image update and might reference uniquely named files.
They should always be refreshed.
We use a `public, max-age=0, must-revalidate` configuration, so the browser will always try to revalidate if the files are still fresh on each load.

### Environment Configuration

The image makes selected environment variables that are provided in the _deployment_ of the container (for example in Kubernetes) available to the widget.
They are available in the `window.__ENVIRONMENT__` variable as a base64 encoded JSON file (example: `eyJSRUFDVF9BUFBfRVhBTVBMRSI6ICJteS12YWx1ZSJ9 === base64({"REACT_APP_EXAMPLE": "my-value"})`).

### `Content-Security-Policy` for dynamic code

In addition to the environment variables, the image provides the `$cspNonce` to the module that is unique per request.
It is supported by a number of different libraries (example: [`styled-components`](https://github.com/styled-components/styled-components/pull/1022)) and can also be provided to [Webpack](https://webpack.js.org/guides/csp/).
The nonce can be read from the `window.NONCE` variable.

### Custom `Content-Security-Policy`

The default `Content-Security-Policy` can be replaced if needed.
Simply replace the `/etc/nginx/conf.d/headers/content-security-policy.conf` file in when building your container image or in the deployment.
Note that the `$__STYLE_CSP_NONCE__` will be used to add the unique nonce to each request.

It is also possible to extend the existing CSP with additional values:
The values of the `CSP_FONT_SRC`, `CSP_STYLE_SRC`, `CSP_SCRIPT_SRC`, `CSP_IMG_SRC`, `CSP_CONNECT_SRC` environment variables will be appended to the respecting policy.
Environment variable references can be added as string, e.g. `export CSP_IMG_SRC='${REACT_APP_HOME_SERVER_URL}'`.
Note that it is not possible to remove existing entries without replacing the `content-security-policy.conf` file.
