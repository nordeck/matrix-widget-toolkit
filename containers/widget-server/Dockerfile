FROM nginx:1.27.4-alpine-perl@sha256:b948629705bb94a3947846babda0a222577b1eadcc3e551bfafef47c7581666b

# Install envsubst
RUN apk add --no-cache gettext

# Make sure all directories are accessible by the non-root user
# Inspired by https://hub.docker.com/r/nginxinc/nginx-unprivileged
RUN set -x\
    && chown -R 101:0 /var/cache/nginx \
    && chmod -R g+w /var/cache/nginx \
    && chown -R 101:0 /etc/nginx \
    && chmod -R g+w /etc/nginx \
    && sed -i '/user  nginx;/d' /etc/nginx/nginx.conf \
    && sed -i 's,/var/run/nginx.pid,/tmp/nginx.pid,' /etc/nginx/nginx.conf

# The nginx base image already creates the nginx user with UID 101 and GUI 101
USER 101

# Add the nginx configuration
COPY files/default.conf /etc/nginx/conf.d/

# Store the CSP header in a separate file to make it replacable in the deployment.
COPY files/content-security-policy.conf /etc/nginx/conf.d/custom/

# Setup the default listen directive. You can map other files to it
# on your deployments to support different configs (e.g. IPv4-only).
COPY files/listen.conf /etc/nginx/conf.d/custom/

# Add mimetypes configuration
COPY files/mimetypes.conf /etc/nginx/conf.d/custom/

# Create a new entrypoint that exports a __ENVIRONMENT_SCRIPT__ variable
# from all REACT_APP_* environment variables.
COPY files/provide_environment.sh /

# Declare volumes where the nginx needs to write to. This is required
# if the container is stared with a read-only file system.
VOLUME /var/cache/nginx /tmp

ENTRYPOINT [ "/provide_environment.sh" ]
CMD [ "nginx", "-g", "daemon off; load_module \"modules/ngx_http_perl_module.so\"; env __ENVIRONMENT_SCRIPT__; env __CSP_FONT_SRC__; env __CSP_STYLE_SRC__; env __CSP_SCRIPT_SRC__; env __CSP_IMG_SRC__; env __CSP_CONNECT_SRC__;" ]
