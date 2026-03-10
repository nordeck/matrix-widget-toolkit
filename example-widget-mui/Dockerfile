FROM ghcr.io/nordeck/matrix-widget-toolkit/widget-server:1@sha256:55aa10d9adfb5ff8f72de7017d18a7230843bd8b056573c08a2429ad463c5564

# Allow loading images from all HTTP(s) URLs and blobs
ENV CSP_IMG_SRC="http: https: blob:"
# Also with fetch/XMLHttpRequest
ENV CSP_CONNECT_SRC="http: https: blob:"

ADD build /usr/share/nginx/html/
