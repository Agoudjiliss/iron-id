#!/usr/bin/env bash
# ============================================================
# IronID — Vercel Deployment Script
# Run this ONCE on your local machine.
# Prerequisites: npm, vercel CLI (installed automatically)
# ============================================================
set -euo pipefail

WEB_DIR="apps/web"

echo "==> [1/5] Vercel CLI..."
if ! command -v vercel &>/dev/null; then
  npm install -g vercel
fi

echo "==> [2/5] Login to Vercel (browser will open)..."
vercel login

echo "==> [3/5] Link project to Vercel..."
cd "$WEB_DIR"
vercel link \
  --project="iron-id" \
  --yes 2>/dev/null || vercel link --yes

echo "==> [4/5] Setting environment variables..."

set_env() {
  local key="$1"
  local val="$2"
  local scope="${3:-production,preview,development}"
  echo "$val" | vercel env add "$key" "$scope" --force 2>/dev/null || true
}

# Clerk
set_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "pk_test_bmV3LWJvYS00Ni5jbGVyay5hY2NvdW50cy5kZXYk"
set_env "CLERK_SECRET_KEY"                  "sk_test_HqS9adDimmLHVHn37QNK2JfUUtVu3fB9zsNuCIbQPt"

# API
set_env "NEXT_PUBLIC_API_URL"   "https://api.iron-id.io"
set_env "NEXT_PUBLIC_APP_URL"   "https://iron-id.io"

echo ""
echo "⚠  Set these env vars manually on vercel.com/dashboard (sensitive):"
echo "   NEXT_PUBLIC_POSTHOG_KEY     → your PostHog project key"
echo "   NEXT_PUBLIC_SENTRY_DSN      → your Sentry DSN"
echo ""

echo "==> [5/5] Deploy to production..."
vercel --prod

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ Frontend deployed!                                ║"
echo "║                                                       ║"
echo "║  Now add your custom domain in Vercel dashboard:      ║"
echo "║  → vercel.com/dashboard → iron-id → Settings →       ║"
echo "║    Domains → Add: iron-id.io and www.iron-id.io       ║"
echo "╚═══════════════════════════════════════════════════════╝"
