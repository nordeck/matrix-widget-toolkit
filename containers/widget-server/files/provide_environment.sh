#!/bin/sh

# Create a new entrypoint that exports a __ENVIRONMENT_SCRIPT__ variable
# from all REACT_APP_* environment variables. The variable contains a
# variable assignment to window.__ENVIRONMENT__  that should be put
# into a <script>.

set -e

JSON_CONTENT=""

IS_FIRST=true

while IFS='=' read -r -d '' n v; do
    if [[ "$n" =~ ^REACT_APP_.* ]]; then
        if [[ "$IS_FIRST" = false ]]; then
            JSON_CONTENT="$JSON_CONTENT,"
        fi
        IS_FIRST=false

        JSON_CONTENT="${JSON_CONTENT}\"$n\":\"$v\""
    fi
done < <(env -0)

__ENVIRONMENT__=`echo -n "{$JSON_CONTENT}" | base64 -w 0`
export __ENVIRONMENT_SCRIPT__="window.__ENVIRONMENT__ = '${__ENVIRONMENT__}';"

# compile the CSP hooks
export __CSP_FRAME_SRC__=`echo $CSP_FRAME_SRC | envsubst`
export __CSP_FONT_SRC__=`echo $CSP_FONT_SRC | envsubst`
export __CSP_STYLE_SRC__=`echo $CSP_STYLE_SRC | envsubst`
export __CSP_SCRIPT_SRC__=`echo $CSP_SCRIPT_SRC | envsubst`
export __CSP_IMG_SRC__=`echo $CSP_IMG_SRC | envsubst`
export __CSP_CONNECT_SRC__=`echo $CSP_CONNECT_SRC | envsubst`

exec "/docker-entrypoint.sh" "$@"
