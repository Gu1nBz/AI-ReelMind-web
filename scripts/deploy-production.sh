#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/reelmind-web}"
DOMAIN="${DOMAIN:-reelmind.ylcmx.xyz}"
APP_PORT="${APP_PORT:-8081}"
ACME_ROOT="${ACME_ROOT:-/var/www/certbot}"
NGINX_SITE="/etc/nginx/sites-available/${DOMAIN}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$1 is not installed on the server." >&2
    exit 1
  fi
}

require_command docker
require_command nginx
require_command certbot

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is not installed on the server." >&2
  exit 1
fi

cd "$APP_DIR"

sudo docker compose up -d --build --remove-orphans
sudo docker image prune -f

sudo mkdir -p "$ACME_ROOT"

write_http_site() {
  sudo tee "$NGINX_SITE" >/dev/null <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log /var/log/nginx/${DOMAIN}.error.log;

    location /.well-known/acme-challenge/ {
        root ${ACME_ROOT};
    }

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
}

write_https_site() {
  sudo tee "$NGINX_SITE" >/dev/null <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root ${ACME_ROOT};
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate ${CERT_DIR}/fullchain.pem;
    ssl_certificate_key ${CERT_DIR}/privkey.pem;

    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log /var/log/nginx/${DOMAIN}.error.log;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX
}

if [ -f "${CERT_DIR}/fullchain.pem" ] && [ -f "${CERT_DIR}/privkey.pem" ]; then
  write_https_site
else
  write_http_site
fi

sudo ln -sfn "$NGINX_SITE" "$NGINX_ENABLED"
sudo nginx -t
sudo systemctl reload nginx

if [ ! -f "${CERT_DIR}/fullchain.pem" ] || [ ! -f "${CERT_DIR}/privkey.pem" ]; then
  sudo certbot certonly \
    --webroot \
    --webroot-path "$ACME_ROOT" \
    --domain "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email

  write_https_site
  sudo nginx -t
  sudo systemctl reload nginx
fi
