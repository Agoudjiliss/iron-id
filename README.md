# IronID — The Gold Standard for Digital Truth

Cryptographic C2PA certification and immutable provenance ledger for digital content.

## Architecture

```
ironid/
├── apps/
│   ├── api/          # FastAPI (Python 3.11) — certification engine
│   └── web/          # Next.js 14 (App Router) — dashboard + public pages
├── packages/
│   ├── sdk-js/       # @ironid/sdk — TypeScript/JavaScript SDK
│   └── sdk-python/   # ironid — Python SDK
├── load-tests/       # Locust load tests
└── migrations/       # Alembic (PostgreSQL)
```

**Stack:** Next.js 14 · FastAPI · PostgreSQL 15 + TimescaleDB · Redis 7 · Celery · Clerk · PayPal REST API v2 · Cloudflare R2 · Sentry · PostHog

## Quick Start (local)

### Prerequisites

- Docker + Docker Compose
- Node.js ≥ 20
- Python 3.11+

### 1. Clone & configure

```bash
git clone https://github.com/ironid/ironid.git
cd ironid

cp .env.example .env           # fill in your values
cp apps/web/.env.local.example apps/web/.env.local
```

### 2. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 3. Run migrations

```bash
cd apps/api
pip install -r requirements.txt
alembic -c ../migrations/alembic.ini upgrade head
```

### 4. Start the API

```bash
# Development (with --reload)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Celery worker (separate terminal)
celery -A tasks.celery_app worker --loglevel=info
```

### 5. Start the frontend

```bash
cd apps/web
npm install
npm run dev    # http://localhost:3000
```

## Environment Variables

### Backend (`apps/api/` — from `.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@host/db` |
| `REDIS_URL` | `redis://:pass@host:6379/0` |
| `APP_SECRET_KEY` | Random 32-byte hex (`openssl rand -hex 32`) |
| `APP_ENV` | `development` / `production` |
| `CLERK_SECRET_KEY` | Clerk backend secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret (svix) |
| `PAYPAL_CLIENT_ID` | PayPal REST API client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal REST API client secret |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook ID for signature verification |
| `PAYPAL_MODE` | `sandbox` or `live` |
| `PAYPAL_PLAN_*` | PayPal subscription plan IDs (create via API or dashboard) |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public CDN URL for certified files |
| `SENTRY_DSN` | Sentry DSN (optional, production only) |
| `FRONTEND_URL` | Frontend origin (for affiliate links) |
| `CORS_ORIGINS` | Comma-separated allowed origins |

### Frontend (`apps/web/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key (SSR only) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_API_URL` | Public API URL (rewrites target) |
| `INTERNAL_API_URL` | Docker-internal API URL for SSR |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for client-side errors |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (default: `https://app.posthog.com`) |

## API Reference

Base URL: `https://api.ironid.io`

Authentication: `Authorization: Bearer iid_live_...`

### Certifications

```
POST   /v1/certify              Submit file for certification (202 Accepted)
GET    /v1/certify/{id}         Poll certification status
GET    /v1/certifications       List certifications (paginated)
```

### Verification (public — no auth)

```
POST   /v1/verify               Verify file by upload
GET    /v1/verify/{hash}        Look up certification by SHA-256 hash
```

### API Keys

```
POST   /v1/keys                 Create API key (raw key shown once)
GET    /v1/keys                 List keys
DELETE /v1/keys/{id}            Revoke key
```

### Billing

```
GET    /v1/billing/plans        List available plans
POST   /v1/billing/subscribe    Create PayPal subscription
POST   /v1/billing/payg         Create PAYG order ($0.10/signature)
GET    /v1/billing/subscription Current subscription status
POST   /v1/billing/cancel       Cancel subscription
```

### Affiliate

```
GET    /v1/affiliate/link       Get referral link
GET    /v1/affiliate/stats      Full affiliate dashboard snapshot
GET    /v1/affiliate/commissions Paginated commission history
```

### Webhooks

```
POST   /v1/webhooks/paypal      PayPal event receiver
POST   /v1/webhooks/clerk       Clerk user lifecycle events
```

## SDKs

### JavaScript / TypeScript

```bash
npm install @ironid/sdk
```

```typescript
import { IronID } from '@ironid/sdk';

const client = new IronID({ apiKey: 'iid_live_...' });

const cert = await client.certifications.certifyAndWait({
  file: fs.readFileSync('photo.jpg'),
  filename: 'photo.jpg',
  metadata: { author: 'Jane Doe' },
});
console.log(cert.file_hash_sha256);

const result = await client.verify.byHash(cert.file_hash_sha256!);
console.log(result.is_certified); // true
```

### Python

```bash
pip install ironid
```

```python
from ironid import IronID

with IronID(api_key="iid_live_...") as client:
    cert = client.certifications.certify_and_wait(
        open("photo.jpg", "rb"),
        filename="photo.jpg",
        metadata={"author": "Jane Doe"},
    )
    print(cert.file_hash_sha256)

    result = client.verify.by_hash(cert.file_hash_sha256)
    print(result.is_certified)  # True
```

## Deployment

### Railway (API + Celery)

1. Create two Railway services: `ironid-api` and `ironid-celery`
2. Set env vars in Railway dashboard (see table above)
3. Push to `main` — GitHub Actions deploys automatically

```bash
# Manual deploy
railway up --service ironid-api
railway up --service ironid-celery
```

### Vercel (Frontend)

1. Import `apps/web` in Vercel
2. Set env vars in Vercel dashboard
3. Deploy — Vercel handles Next.js standalone output

```bash
# Manual deploy
cd apps/web
vercel --prod
```

### Docker (self-hosted)

```bash
# Production stack (requires managed Postgres + Redis)
cp .env.example .env        # fill DATABASE_URL, REDIS_URL, etc.
docker compose -f docker-compose.prod.yml up -d
```

## Tests

### API (unit + integration)

```bash
cd apps/api

# Unit tests (no server required)
pytest tests/test_c2pa_service.py tests/test_file_service.py tests/test_api_key_service.py -v

# Integration tests (requires running API at TEST_API_BASE_URL)
TEST_API_KEY=iid_test_... pytest tests/ -v -m 'not slow'

# Including rate-limit tests (slow)
TEST_API_KEY=iid_test_... pytest tests/ -v
```

### Load tests

```bash
pip install locust
TEST_API_KEY=iid_test_... locust -f load-tests/locustfile.py --host http://localhost:8000
# Open http://localhost:8089 — configure users / ramp-up
```

## Security

- **API keys:** bcrypt cost=12, only the `iid_live_XXXX` prefix stored for display
- **Ledger:** PostgreSQL Row-Level Security blocks `UPDATE`/`DELETE` at DB level — immutable by design
- **Webhook verification:** PayPal signatures verified via PayPal API; Clerk signatures via svix
- **File validation:** Magic-byte MIME detection (not Content-Type header) prevents spoofing
- **Rate limiting:** Redis sliding window — 30 req/min (public) · 60 req/min (authenticated)
- **Non-root Docker:** all containers run as UID 1001

## Affiliate Program

- Generate referral link at `/affiliate`
- Last-click attribution — 90-day cookie (`ironid_ref`)
- Tiered commissions:

| Tier | Active referrals | Commission |
|---|---|---|
| Iron | 0–5 | 10% |
| Bronze | 6–14 | 12% |
| Silver | 15–29 | 15% |
| Gold | 30–49 | 17% |
| Platinum | 50+ | 20% |

- PayPal payout after 30-day anti-fraud hold (minimum $1.00)

## Plans

| Plan | Price | Certifications/month |
|---|---|---|
| Free | $0 | 10 |
| Pay-as-you-go | $0.10/cert | Unlimited |
| Individual | $29/mo | 500 |
| Studio | $199/mo | 5 000 |
| Enterprise | $1 200/mo | 100 000 |

## License

MIT © IronID
