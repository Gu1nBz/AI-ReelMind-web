#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/reelmind-web}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$1 is not installed on the server." >&2
    exit 1
  fi
}

require_command docker

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is not installed on the server." >&2
  exit 1
fi

cd "$APP_DIR"

sudo docker compose up -d --force-recreate --remove-orphans
sudo docker image prune -f
