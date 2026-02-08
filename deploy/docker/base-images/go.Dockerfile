# ──────────────────────────────────────────────────────────────
# Berhot – Go Base Image (multi-stage)
# Used by: identity-access, tenant-management, pos-engine,
#          loyalty, queue-waitlist, time-attendance, hardware
# ──────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder
RUN apk add --no-cache git ca-certificates tzdata
WORKDIR /build

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Build
COPY . .
ARG SERVICE_NAME
ARG VERSION=dev
ARG BUILD_TIME
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s -X main.version=${VERSION} -X main.buildTime=${BUILD_TIME}" \
    -o /app/server ./cmd/server/main.go

# ── Production stage ──────────────────────────────────────────
FROM alpine:3.19 AS production
RUN apk add --no-cache ca-certificates tzdata curl && \
    addgroup -S berhot && adduser -S berhot -G berhot
WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /build/configs ./configs

RUN chown -R berhot:berhot /app
USER berhot

ENV GIN_MODE=release
EXPOSE 8080
EXPOSE 9090

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["./server"]
