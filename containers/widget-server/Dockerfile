FROM nginx:1.27.2-alpine-perl

# Install envsubst
RUN apk add --no-cache gettext

# Add the nginx configuration
COPY files/default.conf /etc/nginx/conf.d/

# Make sure all directories are accessible by the non-root user and wrangle
# files around to enable IPv4-only by duplicating `nginx.conf` and`default.conf`
# and replacing the `listen` directive.
#
# The `/docker-entrypoint.sh` script is also modified to replace `nginx` with `/bin/sh`
# to allow the container to be started with a read-only file system, run the entry point scripts
# and use a runtime determined configuration file.
#
# IMPORTANT: Copying additional scripts to /etc/nginx/conf.d/ will not work as we nodify
#            nginx.{ipv4.}conf to only load default.{ipv4.}conf from the conf.d directory.
#
# Inspired by https://hub.docker.com/r/nginxinc/nginx-unprivileged
RUN set -x\
    && chown -R 101:0 /var/cache/nginx \
    && chmod -R g+w /var/cache/nginx \
    && chown -R 101:0 /etc/nginx \
    && chmod -R g+w /etc/nginx \
    && sed -i '/user  nginx;/d' /etc/nginx/nginx.conf \
    && sed -i 's,/var/run/nginx.pid,/tmp/nginx.pid,' /etc/nginx/nginx.conf \
    && cp /etc/nginx/nginx.conf /etc/nginx/nginx.ipv4.conf \
    && cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.ipv4.conf \
    && sed -i 's/listen \[::\]:8080 ipv6only=off;/listen 8080;/' /etc/nginx/conf.d/default.ipv4.conf \
    && sed -i 's,include /etc/nginx/conf.d/\*.conf;,include /etc/nginx/conf.d/default.conf;,' /etc/nginx/nginx.conf \
    && sed -i 's,include /etc/nginx/conf.d/\*.conf;,include /etc/nginx/conf.d/default.ipv4.conf;,' /etc/nginx/nginx.ipv4.conf \
    && sed -i 's,\"\$1\" = \"nginx\",\"\$1\" = \"/bin/sh\",' /docker-entrypoint.sh

# The nginx base image already creates the nginx user with UID 101 and GUI 101
USER 101

# Store the CSP header in a separate file to make it replacable in the deployment.
COPY files/content-security-policy.conf /etc/nginx/conf.d/headers/

# Create a new entrypoint that:
# 1. checks for IPv6 support and falls back to IPv4-only config if not available.
# 2. exports a __ENVIRONMENT_SCRIPT__ variable from all REACT_APP_* environment variables.
COPY files/provide_environment.sh /

# Declare volumes where the nginx needs to write to. This is required
# if the container is started with a read-only file system.
VOLUME /var/cache/nginx /tmp

ENTRYPOINT [ "/provide_environment.sh" ]
# The entrypoint script will determine the default configuration file for nginx
CMD ["/bin/sh", "-c", "nginx -c $DEFAULT_CONF_FILE -g 'daemon off; load_module modules/ngx_http_perl_module.so; env __ENVIRONMENT_SCRIPT__; env __CSP_FONT_SRC__; env __CSP_STYLE_SRC__; env __CSP_SCRIPT_SRC__; env __CSP_IMG_SRC__; env __CSP_CONNECT_SRC__;'"]
