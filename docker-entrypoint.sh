#!/bin/sh
set -eu

files_dir="${FILES_STORAGE_PATH:-/app/files}"

chown -R node:node "${files_dir}"

exec su-exec node "$@"
