FROM nginx:1.26.0-alpine-perl

# Install envsubst
RUN apk add --no-cache gettext

# Make sure all directories are accessable by the non-root user 
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
COPY files/content-security-policy.conf /etc/nginx/conf.d/headers/

# Create a new entrypoint that exports a __ENVIRONMENT_SCRIPT__ variable
# from all REACT_APP_* environment variables.
COPY files/provide_environment.sh /

# Declare volumes where the nginx needs to write to. This is required
# if the container is stared with a read-only file system.
VOLUME /var/cache/nginx /tmp

ENTRYPOINT [ "/provide_environment.sh" ]
CMD [ "nginx", "-g", "daemon off; load_module \"modules/ngx_http_perl_module.so\"; env __ENVIRONMENT_SCRIPT__; env __CSP_FONT_SRC__; env __CSP_STYLE_SRC__; env __CSP_SCRIPT_SRC__; env __CSP_IMG_SRC__; env __CSP_CONNECT_SRC__;" ]
