FROM ghcr.io/nordeck/matrix-widget-toolkit/widget-server:1@sha256:1cb5845a60176e8146a2fe8acde028a5a726f13bc3d4963feccfa581cc9ba62f

# Allow loading images from all HTTP(s) URLs and blobs
ENV CSP_IMG_SRC="http: https: blob:"
# Also with fetch/XMLHttpRequest
ENV CSP_CONNECT_SRC="http: https: blob:"

ADD build /usr/share/nginx/html/
