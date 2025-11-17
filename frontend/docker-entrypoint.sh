#!/bin/bash

# Replace environment variables in the env.js file
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# Execute CMD
exec "$@"