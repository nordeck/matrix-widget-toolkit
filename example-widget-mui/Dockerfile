FROM ghcr.io/nordeck/matrix-widget-toolkit/widget-server:1@sha256:e20146b7f11dfb663874fed7a289e412ce6e8e623c6eb2261e35a220029ba042

# Allow loading images from all HTTP(s) URLs and blobs
ENV CSP_IMG_SRC="http: https: blob:"
# Also with fetch/XMLHttpRequest
ENV CSP_CONNECT_SRC="http: https: blob:"

ADD build /usr/share/nginx/html/
