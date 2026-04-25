#!/usr/bin/env bash
# ============================================================
# IronID — VPS Installation Script
# Runs ON the VPS as root. Installs everything from scratch.
# Usage: sudo ./vps_install.sh api.iron-id.io
# ============================================================
set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain>}"
APP_DIR="/opt/ironid"
REPO_DIR="$APP_DIR/repo"
DB_PASSWORD=$(openssl rand -hex 16)

echo "==> [1/9] System dependencies..."
apt-get update -y
apt-get install -y \
  docker.io docker-compose-v2 nginx certbot python3-certbot-nginx \
  postgresql postgresql-contrib redis-server \
  ufw curl git openssl

echo "==> [2/9] Configure firewall..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> [3/9] Configure PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ironid') THEN
    CREATE ROLE ironid LOGIN PASSWORD '$DB_PASSWORD';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ironid OWNER ironid' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ironid')\gexec
GRANT ALL PRIVILEGES ON DATABASE ironid TO ironid;
SQL

echo "==> [4/9] Configure Redis..."
sed -i 's/^# bind 127.0.0.1/bind 127.0.0.1/' /etc/redis/redis.conf || true
systemctl start redis-server
systemctl enable redis-server

echo "==> [5/9] Setup application directory..."
mkdir -p "$APP_DIR"
cp /tmp/.env.production "$APP_DIR/.env"
# Inject generated credentials
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql+asyncpg://ironid:$DB_PASSWORD@localhost:5432/ironid|" "$APP_DIR/.env"
sed -i "s|REDIS_URL=.*|REDIS_URL=redis://localhost:6379/0|" "$APP_DIR/.env"
echo "    DB password saved to $APP_DIR/.env"

echo "==> [6/9] Clone repo..."
if [ -d "$REPO_DIR/.git" ]; then
  cd "$REPO_DIR" && git pull origin main
else
  git clone https://github.com/Agoudjiliss/iron-id.git "$REPO_DIR"
fi

echo "==> [7/9] Build Docker image (context = monorepo root)..."
cd "$REPO_DIR"
docker build \
  -f apps/api/Dockerfile \
  -t ironid-api:latest \
  .

echo "==> [8/9] Start containers..."
docker rm -f ironid-api ironid-celery 2>/dev/null || true

docker run -d \
  --name ironid-api \
  --restart always \
  --env-file "$APP_DIR/.env" \
  --network host \
  ironid-api:latest

docker run -d \
  --name ironid-celery \
  --restart always \
  --env-file "$APP_DIR/.env" \
  --network host \
  ironid-api:latest \
  celery -A tasks.celery_app worker --loglevel=info

echo "    Waiting for API to start..."
sleep 8

echo "    Running database migrations..."
docker exec ironid-api sh -c "alembic -c /migrations/alembic.ini -x db_url=\"\$DATABASE_URL\" upgrade head" || \
  docker exec ironid-api sh -c "cd /app && DATABASE_URL=\$DATABASE_URL alembic -c /migrations/alembic.ini upgrade head" || \
  echo "    ⚠ Migrations failed — check logs: docker logs ironid-api"

echo "==> [9/9] Configure Nginx + SSL..."
cat > /etc/nginx/sites-available/ironid <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass          http://127.0.0.1:8000;
        proxy_http_version  1.1;
        proxy_set_header    Host               \$host;
        proxy_set_header    X-Real-IP          \$remote_addr;
        proxy_set_header    X-Forwarded-For    \$proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto  \$scheme;
        proxy_read_timeout  300;
        proxy_send_timeout  300;
        client_max_body_size 100M;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/ironid /etc/nginx/sites-enabled/ironid
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "    Requesting SSL certificate for $DOMAIN..."
certbot --nginx -d "$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email "contact@iron-id.io" \
  --redirect || echo "    ⚠ SSL failed — ensure DNS is pointed to this IP, then run: certbot --nginx -d $DOMAIN"

# Auto-renew SSL
echo "0 0,12 * * * root python3 -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" \
  >> /etc/cron.d/certbot

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ IronID API is live!                              ║"
echo "║                                                      ║"
echo "║  Health: https://$DOMAIN/health         ║"
echo "║  Docs:   https://$DOMAIN/docs           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Useful commands:"
echo "  docker logs -f ironid-api"
echo "  docker logs -f ironid-celery"
echo "  docker exec -it ironid-api bash"
