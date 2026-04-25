# ============================================================
# IronID API Dockerfile
# Build context: monorepo root (ironid/)
# docker build -f apps/api/Dockerfile -t ironid-api .
# ============================================================

# ---- Builder stage ----
FROM python:3.11-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY apps/api/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ---- Runtime stage ----
FROM python:3.11-slim AS runtime

# Non-root user for security
RUN groupadd --gid 1001 ironid && \
    useradd --uid 1001 --gid ironid --shell /bin/sh --create-home ironid

WORKDIR /app

# Runtime system libs only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy API source
COPY --chown=ironid:ironid apps/api/ .

# Copy migrations (needed for alembic upgrade head)
COPY --chown=ironid:ironid migrations/ /migrations/

USER ironid

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default: production API server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "2", "--log-level", "info"]
