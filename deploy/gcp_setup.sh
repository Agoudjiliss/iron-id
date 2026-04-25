#!/usr/bin/env bash
# ============================================================
# IronID — GCP VPS Setup Script
# Region: europe-west9 (Paris)
# Machine: e2-standard-2 (2 vCPU / 8 GB)
# Run this ONCE on your local machine (requires gcloud CLI)
# ============================================================
set -euo pipefail

# ── CONFIG ────────────────────────────────────────────────────
PROJECT_ID="${GCP_PROJECT_ID:-iron-id-prod}"
REGION="europe-west9"
ZONE="europe-west9-a"
INSTANCE_NAME="ironid-api"
MACHINE_TYPE="e2-standard-2"
DISK_SIZE="40GB"
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
# ─────────────────────────────────────────────────────────────

echo "==> [1/6] Creating GCP project (skip if exists)..."
gcloud projects create "$PROJECT_ID" --name="IronID Production" 2>/dev/null || true
gcloud config set project "$PROJECT_ID"

echo "==> [2/6] Enabling billing & APIs..."
echo "    ⚠  If billing is not enabled, go to: https://console.cloud.google.com/billing"
gcloud services enable compute.googleapis.com --project="$PROJECT_ID"
gcloud services enable dns.googleapis.com    --project="$PROJECT_ID"

echo "==> [3/6] Creating static IP address..."
gcloud compute addresses create ironid-api-ip \
  --region="$REGION" \
  --project="$PROJECT_ID" 2>/dev/null || echo "    (address already exists)"

STATIC_IP=$(gcloud compute addresses describe ironid-api-ip \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="get(address)")
echo "    Static IP: $STATIC_IP"

echo "==> [4/6] Creating firewall rules..."
gcloud compute firewall-rules create ironid-allow-http-https \
  --project="$PROJECT_ID" \
  --allow="tcp:80,tcp:443" \
  --source-ranges="0.0.0.0/0" \
  --target-tags="ironid-api" \
  --description="Allow HTTP/HTTPS for IronID API" 2>/dev/null || echo "    (rule already exists)"

gcloud compute firewall-rules create ironid-allow-ssh \
  --project="$PROJECT_ID" \
  --allow="tcp:22" \
  --source-ranges="0.0.0.0/0" \
  --target-tags="ironid-api" \
  --description="Allow SSH for IronID API" 2>/dev/null || echo "    (rule already exists)"

echo "==> [5/6] Creating VM instance..."
gcloud compute instances create "$INSTANCE_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --machine-type="$MACHINE_TYPE" \
  --image-family="$IMAGE_FAMILY" \
  --image-project="$IMAGE_PROJECT" \
  --boot-disk-size="$DISK_SIZE" \
  --boot-disk-type="pd-ssd" \
  --address="ironid-api-ip" \
  --tags="ironid-api" \
  --metadata="startup-script=#! /bin/bash
apt-get update -y
apt-get install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx ufw git curl
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu
ufw allow 22 && ufw allow 80 && ufw allow 443 && echo 'y' | ufw enable
" 2>/dev/null || echo "    (instance already exists)"

echo "==> [6/6] Done!"
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  NEXT STEP: Configure your DNS                           ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Add these DNS records at your domain registrar:         ║"
echo "║                                                          ║"
echo "║  A  iron-id.io          → $STATIC_IP          ║"
echo "║  A  www.iron-id.io      → $STATIC_IP          ║"
echo "║  A  api.iron-id.io      → $STATIC_IP          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Then run: ./deploy/gcp_provision.sh $STATIC_IP"
