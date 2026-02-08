# ──────────────────────────────────────────────────────────────
# Berhot – Node.js Base Image (multi-stage)
# Used by: NestJS services, client builds
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app

# ── Dependencies stage ────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/libraries/*/package.json ./shared/libraries/
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# ── Builder stage ─────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm turbo build --filter=./shared/libraries/*

# ── Production stage ──────────────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache libc6-compat curl dumb-init
RUN addgroup --system --gid 1001 berhot && \
    adduser --system --uid 1001 berhot
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder --chown=berhot:berhot /app/node_modules ./node_modules
COPY --from=builder --chown=berhot:berhot /app/shared/libraries ./shared/libraries

USER berhot
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
