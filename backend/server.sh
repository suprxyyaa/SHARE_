#!/usr/bin/env sh
set -eu

PORT="${PORT:-8000}"
WORKERS="${WEB_CONCURRENCY:-2}"

exec gunicorn app.main:app \
  --workers "$WORKERS" \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind "0.0.0.0:${PORT}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
