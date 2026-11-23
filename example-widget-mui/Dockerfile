FROM ghcr.io/nordeck/matrix-widget-toolkit/widget-server:1@sha256:67caa0811f39a4a34514e40c935ebd472ef0b3a8eb826dbe4a7300152959f0ce

# Allow loading images from all HTTP(s) URLs and blobs
ENV CSP_IMG_SRC="http: https: blob:"
# Also with fetch/XMLHttpRequest
ENV CSP_CONNECT_SRC="http: https: blob:"

ADD build /usr/share/nginx/html/
