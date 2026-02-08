# ──────────────────────────────────────────────────────────────
# Berhot – Python Base Image (multi-stage)
# Used by: marketing, reviews-feedback, analytics-core
# ──────────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Production stage ──────────────────────────────────────────
FROM python:3.12-slim AS production
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -r berhot && useradd -r -g berhot berhot

WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .

RUN chown -R berhot:berhot /app
USER berhot

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
