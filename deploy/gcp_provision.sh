#!/usr/bin/env bash
# ============================================================
# IronID — GCP VPS Provision Script
# Run this AFTER the VM is created and DNS is configured.
# Usage: ./deploy/gcp_provision.sh <VPS_IP>
# ============================================================
set -euo pipefail

VPS_IP="${1:?Usage: $0 <VPS_IP>}"
SSH_USER="ubuntu"
DOMAIN_API="api.iron-id.io"

echo "==> Copying provision script to VPS..."
scp -o StrictHostKeyChecking=no deploy/vps_install.sh "$SSH_USER@$VPS_IP:/tmp/vps_install.sh"
scp -o StrictHostKeyChecking=no .env.production "$SSH_USER@$VPS_IP:/tmp/.env.production"

echo "==> Running provision on VPS..."
ssh -o StrictHostKeyChecking=no "$SSH_USER@$VPS_IP" "chmod +x /tmp/vps_install.sh && sudo /tmp/vps_install.sh $DOMAIN_API"

echo ""
echo "✅ VPS provisioned! API should be live at https://$DOMAIN_API/health"
