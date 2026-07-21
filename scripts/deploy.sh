#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APP_NAME="babelkid"
PORT=3008

echo "==> Deploying ${APP_NAME} (port ${PORT})"
echo "    Directory: ${ROOT}"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Error: pm2 is not installed. Install with: npm install -g pm2"
  exit 1
fi

if [[ "${SKIP_GIT_PULL:-}" != "1" ]] && git rev-parse --git-dir >/dev/null 2>&1; then
  echo "==> Pulling latest changes..."
  git pull --ff-only
fi

echo "==> Installing dependencies..."
npm ci

echo "==> Building application..."
npm run build

echo "==> Reloading PM2 process..."
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo "==> Deploy complete."
pm2 info "$APP_NAME"
