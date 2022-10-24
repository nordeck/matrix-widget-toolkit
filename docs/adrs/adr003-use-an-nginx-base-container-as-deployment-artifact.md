# ADR001: Use an nginx-based Container as a Deployment Artifact

Status: accepted

<!-- These documents have names that are short noun phrases. For example, "ADR001: Deployment on Ruby on Rails 3.0.10" or "ADR009: LDAP for Multitenant Integration" -->

## Context

<!--
This section describes the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such. The language in this section is value-neutral. It is simply describing facts. -->

A widget is a static website that must be hosted on a webserver in order to be usable.
We aim to execute the website inside of a Kubernetes-based environment and thus our artifact needs to be an OCI-compatible container.

Since widgets might need configuration flags that are defined at deployment time, we need a way to access these in the compiled application.
Create React App provides the `REACT_APP_*` environment variables during compile time and in the local development server, so we should also support them in the production artifact.

## Decision

<!-- This section describes our response to these forces. It is stated in full sentences, with active voice. "We will ..." -->

We will use [`nginx`](https://hub.docker.com/_/nginx) as a base image.
We will make all environment variables with the format `REACT_APP_*` available to the frontend.
We will use the `perl` features of `nginx` to dynamically inject the variables into the already built artifacts.

### Alternatives

**Use a Node.js server**:
Other widgets use an `express` server with a `mustache` template in the `index.html` for this task.
However, using a full-featured `node` image seems to be overkill and has an increased potential attack surface.
Furthermore, we assume that `nginx` is more performant.

**Do a file-based template replacement**:
We could update the `index.html` on startup instead of using the `perl` extension for doing the in-memory replacement.
However, manipulating files in the container image might be problematic if the container is used in a Kubernetes deployment with the `ReadOnlyRootFilesystem` flag.

## Consequences

<!-- This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones. A particular decision may have positive, negative, and neutral consequences, but all of them affect the team and project in the future. -->

There is an official `nginx:[alpine-]perl` image that includes the `nginx` with the `perl` extension.
We will append a `<script>` tag and provide the environment variables into the `index.html` file:

```html
<!-- index.html -->

<html>
  <head>
    <!-- more headers -->

    <!-- we add the following to the index.html -->
    <!--#echo var="__INJECT_SCRIPT_TAG__" encoding="none"-->

    <!-- perl will replace it with the following on runtime -->
    <script nonce="NONCE_PER_REQUEST">
      // 1. collect all env variables in a JSON object: {"REACT_APP_TEST": "MY_VALUE"}
      // 2. run a base64 encoding: eyJSRUFDVF9BUFBfVEVTVCI6ICJNWV9WQUxVRSJ9
      // 3. provide it to the window object:
      window.__ENVIRONMENT__ = 'eyJSRUFDVF9BUFBfVEVTVCI6ICJNWV9WQUxVRSJ9';
      // Provide the generated nonce for the request so our code
      // can dynamically add scripts or styles
      window.NONCE = 'NONCE_PER_REQUEST';
    </script>
  </head>
  <body>
    <!-- the body -->
  </body>
</html>
```

> We will provide a CSP setting to permit `'nonce-NONCE_PER_REQUEST'` for styles and scripts.
> We will use the `$request_id` [as nonce](https://serverfault.com/questions/934801/is-it-a-good-idea-to-use-nginx-request-id-for-csp-nonce-value).

The script tag will be generated in the custom entrypoint script that stores it into the `__ENVIRONMENT_SCRIPT__` environment variable.

### nginx config

The `nginx` configuration must be amended to use the templating feature:

1. Activate the `perl` module: `load_module "modules/ngx_http_perl_module.so"; env __ENVIRONMENT_SCRIPT__;`.
2. Permit access to the `__ENVIRONMENT_SCRIPT__` (by default all environment variables are removed for security reasons):: `env __ENVIRONMENT_SCRIPT__;`.
3. Convert the environment variable to a `perl` variable: `perl_set $__ENVIRONMENT_SCRIPT__ 'sub { return $ENV{"__ENVIRONMENT_SCRIPT__"}; }';`.
4. Enable `ssi` in the default location: `location / { ssi on; /** more **/ }`.

<!-- This template is taken from a blog post by Michael Nygard http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions -->
