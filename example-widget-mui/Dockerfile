FROM ghcr.io/nordeck/matrix-widget-toolkit/widget-server:1@sha256:77c23bd22699771e682dac9ec34e1a73c00728405bd77a160d2df22a7922800f

# Allow loading images from all HTTP(s) URLs and blobs
ENV CSP_IMG_SRC="http: https: blob:"
# Also with fetch/XMLHttpRequest
ENV CSP_CONNECT_SRC="http: https: blob:"

ADD build /usr/share/nginx/html/
