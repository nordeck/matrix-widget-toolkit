FROM ghcr.io/nordeck/matrix-widget-toolkit/widget-server:1@sha256:fd7bef03389b7506112cd5f89e98da51f4ce720ee1cd027026e2f1cfbcd30007

# Allow loading images from all HTTP(s) URLs and blobs
ENV CSP_IMG_SRC="http: https: blob:"
# Also with fetch/XMLHttpRequest
ENV CSP_CONNECT_SRC="http: https: blob:"

ADD build /usr/share/nginx/html/
