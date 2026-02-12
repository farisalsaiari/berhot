# Berhot Platform - First Time Setup

Follow these steps in order. Copy-paste each block and wait for it to finish before moving to the next.

---

## Step 1: Install Prerequisites

```bash
# Node.js 20+ (skip if already installed)
brew install node

# pnpm 9+
corepack enable
corepack prepare pnpm@9.15.4 --activate

# PostgreSQL client (needed for migrations)
brew install postgresql@17

# Docker Desktop — download and open from:
# https://www.docker.com/products/docker-desktop/

# Go, Python, Java (needed for non-Node services)
brew install go python@3.11 openjdk@17
```

---

## Step 2: Clone & Install

```bash
git clone <repo-url> berhot
cd berhot
pnpm install
```

---

## Step 3: Setup Environment

```bash
cp config/.env.example .env
```

Defaults work for local dev. No edits needed.

---

## Step 4: Start Docker

Open Docker Desktop first, then:

```bash
pnpm docker:up
```

Wait ~15 seconds for all containers to be healthy:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

You should see all containers showing `Up ... (healthy)`:

| Container              | What it is            |
|------------------------|-----------------------|
| berhot-postgres        | PostgreSQL 16         |
| berhot-redis           | Redis 7               |
| berhot-kafka           | Kafka (KRaft)         |
| berhot-elasticsearch   | Elasticsearch 8.12    |
| berhot-minio           | S3-compatible storage |
| berhot-mongodb         | MongoDB 7             |
| berhot-mailhog         | Email testing         |
| berhot-nginx           | Reverse proxy         |
| berhot-kong            | API Gateway           |
| berhot-pgadmin         | DB admin UI           |
| berhot-kafka-ui        | Kafka admin UI        |
| berhot-redis-commander | Redis admin UI        |
| berhot-prometheus      | Metrics               |
| berhot-grafana         | Dashboards            |
| berhot-jaeger          | Tracing               |
| berhot-loki            | Log aggregation       |

---

## Step 5: Run Database Migrations

# In Bash:
```bash
for f in ops/database/migrations/*.sql; do
  echo "--- Running $f ---"
  PGPASSWORD=berhot_dev_password psql -h localhost -p 5555 -U berhot -d berhot_dev -f "$f"
done
```

# In Powershell
Get-ChildItem ops/database/migrations/*.sql | ForEach-Object { Write-Host "--- Running $_ ---"; Get-Content $_.FullName | docker exec -i berhot-postgres psql -U berhot -d berhot_dev }




This creates 16 core tables: tenants, users, sessions, auth, locations, etc.

---

## Step 6: Seed Database

```bash
PGPASSWORD=berhot_dev_password psql -h localhost -p 5555 -U berhot -d berhot_dev -f ops/database/seeds/initial_data.sql
PGPASSWORD=berhot_dev_password psql -h localhost -p 5555 -U berhot -d berhot_dev -f ops/database/seeds/demo_data.sql
```

---

## Step 7: Build All Packages

```bash
pnpm build
```

This builds all shared libraries in dependency order via Turborepo.

---

## Step 8: Build Non-Node Services

```bash
# Go services (identity, tenancy, pos-engine, loyalty, queue, attendance, hardware)
make go-build

# Python services (marketing, reviews-feedback, analytics-core)
make py-setup

# Java services (payroll, billing-subscriptions)
make java-build
```

---

## Step 9: Start Auth Service (Required)

The identity-access service handles all authentication (`/api/v1/auth/*`).
All frontend apps proxy `/api` requests to this service on port 8080.

```bash
# Open a new terminal tab, then:
cd platform/identity-access
go run ./cmd/server/main.go
```

Keep this terminal open. You should see the server start on port 8080.

Verify it's working:
```bash
curl -s -X POST http://localhost:8080/api/v1/auth/check-user \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@test.com"}'
# Should return: {"exists":false}
```

---

## Step 10: Run Dev Servers

```bash
# Run all apps (assumes Docker infra + auth service are running)
make dev-services
```

Or run specific apps:

```bash
pnpm dev:landing        # Landing page (port 3000)
pnpm dev:dashboard      # Merchant Dashboard
pnpm dev:admin          # Admin Console
pnpm dev:restaurant     # Restaurant POS
pnpm dev:cafe           # Cafe POS
pnpm dev:retail         # Retail POS
pnpm dev:commerce       # All commerce apps
pnpm dev:experience     # Loyalty, queue, marketing
pnpm dev:engagement     # Events, memberships
pnpm dev:workforce      # Shifts, attendance
pnpm dev:platform       # Notification, integration, file services
pnpm dev:marketing      # Marketing website
```

---

## Step 11: Verify Everything Works

Open in browser:

| What                 | URL                          |
|----------------------|------------------------------|
| Landing App          | http://localhost:3000         |
| MailHog (test email) | http://localhost:8025         |
| pgAdmin (DB)         | http://localhost:5050         |
| Kafka UI             | http://localhost:8093         |
| Redis Commander      | http://localhost:8081         |
| Grafana              | http://localhost:9091         |
| Jaeger (tracing)     | http://localhost:16686        |
| MinIO Console        | http://localhost:9001         |
| Kong API Gateway     | http://localhost:8000         |

---

## Stopping Everything

```bash
# Stop dev servers: Ctrl+C in the terminal

# Stop Docker infrastructure
pnpm docker:down

# Destroy everything (removes all data volumes)
make infra-reset
```

---

## Daily Workflow (after first-time setup)

```bash
# 1. Start Docker infra
pnpm docker:up

# 2. Start auth service (new terminal tab)
cd platform/identity-access && go run ./cmd/server/main.go

# 3. Run whatever app you need (another terminal tab)
pnpm dev:landing       # or any other app
```

No need to re-run migrations or seeds unless you ran `make infra-reset`.

---

## Database Connection

| Field    | Value                                                              |
|----------|--------------------------------------------------------------------|
| Host     | `localhost`                                                        |
| Port     | `5555`                                                             |
| User     | `berhot`                                                           |
| Password | `berhot_dev_password`                                              |
| Database | `berhot_dev`                                                       |
| URL      | `postgresql://berhot:berhot_dev_password@localhost:5555/berhot_dev` |

pgAdmin: http://localhost:5050 (login: `admin@berhot.dev` / `admin`)

---

## All Infrastructure Ports

| Service          | Port  | URL                            |
|------------------|-------|--------------------------------|
| PostgreSQL       | 5555  | `localhost:5555`               |
| Redis            | 6379  | `localhost:6379`               |
| Kafka            | 9092  | `localhost:9092`               |
| Elasticsearch    | 9200  | http://localhost:9200          |
| MinIO API        | 9000  | http://localhost:9000          |
| MinIO Console    | 9001  | http://localhost:9001          |
| MongoDB          | 27017 | `localhost:27017`              |
| MailHog SMTP     | 1025  | (SMTP only)                    |
| MailHog UI       | 8025  | http://localhost:8025          |
| Nginx            | 80    | http://localhost               |
| pgAdmin          | 5050  | http://localhost:5050          |
| Kafka UI         | 8093  | http://localhost:8093          |
| Redis Commander  | 8081  | http://localhost:8081          |
| Prometheus       | 9090  | http://localhost:9090          |
| Grafana          | 9091  | http://localhost:9091          |
| Jaeger           | 16686 | http://localhost:16686         |
| Loki             | 3100  | http://localhost:3100          |
| Kong Proxy       | 8000  | http://localhost:8000          |
| Kong Admin       | 8001  | http://localhost:8001          |
| OTLP gRPC        | 4317  | `localhost:4317`               |
| OTLP HTTP        | 4318  | `localhost:4318`               |

---

## Useful Make Commands

| Command              | What it does                         |
|----------------------|--------------------------------------|
| `make help`          | Show all available commands          |
| `make infra-ps`      | Show running containers              |
| `make infra-logs`    | Tail Docker logs                     |
| `make db-studio`     | Open pgAdmin in browser              |
| `make test`          | Run all unit tests                   |
| `make test-e2e`      | Run E2E tests                        |
| `make lint`          | Lint all code                        |
| `make lint-fix`      | Lint + auto-fix                      |
| `make typecheck`     | TypeScript type checking             |
| `make check`         | Lint + typecheck + test              |
| `make clean`         | Remove all build artifacts           |
| `make go-test`       | Test Go services                     |
| `make py-test`       | Test Python services                 |
| `make java-test`     | Test Java services                   |

---

## Troubleshooting

**Port already in use**:
```bash
lsof -i :5555    # find what's using port 5555
kill -9 <PID>    # kill it
```

**Docker containers not starting**: Make sure Docker Desktop is open and running.

**Migrations fail**: PostgreSQL might not be ready yet. Check:
```bash
docker exec berhot-postgres pg_isready -U berhot
```
If it says "accepting connections", try migrations again.

**pnpm install fails**:
```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

**psql not found**:
```bash
brew install postgresql@17
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**`make db-migrate` says "migrate: command not found"**: The Makefile uses `golang-migrate` CLI which is not installed by default. Use the `psql` loop from Step 5 instead.

**`make db-seed` says "database does not exist"**: Needs `DATABASE_URL` env var:
```bash
export DATABASE_URL="postgresql://berhot:berhot_dev_password@localhost:5555/berhot_dev"
```
Note: Makefile references `development.sql` which doesn't exist. Use `initial_data.sql` and `demo_data.sql` from Step 6.



PGPASSWORD=berhot_dev_password psql -h localhost -p 5555 -U berhot -d berhot_dev -f /Users/farisalsaiari/Desktop/2026/berhot/ops/database/migrations/007_locations.sql






----- FRESH START


## kill any processes using ports 3000–3015 and 5001–5020.

✅ Bash (Linux / macOS)

for port in {3000..3015} {5001..5020}; do lsof -ti tcp:$port | xargs -r kill -9; done




✅ PowerShell (Windows)

(3000..3015 + 5001..5020) | ForEach-Object {
  Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
}


pnpm install
pnpm build
pnpm docker:up



## from platform\identity-access>
go run ./cmd/server/main.go


## Step 1 — Copy migrations into the container:



docker cp "C:\Users\HeeMe\OneDrive\Desktop\New\berhot\ops\database\migrations" berhot-postgres:/tmp/migrations

## Step 2 — Run them:

docker exec berhot-postgres bash -c 'for f in /tmp/migrations/*.sql; do echo "=== Running $f ==="; psql -U berhot -d berhot_dev -f "$f" 2>&1; done'


## if fresh database migrations :
PGPASSWORD=berhot_dev_password psql -h localhost -p 5555 -U berhot -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'berhot_dev' AND pid <> pg_backend_pid();" && \
PGPASSWORD=berhot_dev_password psql -h localhost -p 5555 -U berhot -d postgres -c "DROP DATABASE IF EXISTS berhot_dev;" && \
PGPASSWORD=berhot_dev_password psql -h localhost -p 5555 -U berhot -d postgres -c "CREATE DATABASE berhot_dev;" && \
for f in $(ls /Users/farisalsaiari/Desktop/2026/berhot/ops/database/migrations/*.sql | sort); do \
  echo "Running: $f" && \
  PGPASSWORD=berhot_dev_password psql -h localhost -p 5555 -U berhot -d berhot_dev -f "$f"; \
done && \
echo "✅ Database reset complete"



## in windows
$env:PGPASSWORD="berhot_dev_password"
docker exec -e PGPASSWORD=berhot_dev_password berhot-postgres psql -U berhot -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'berhot_dev' AND pid <> pg_backend_pid();"
docker exec -e PGPASSWORD=berhot_dev_password berhot-postgres psql -U berhot -d postgres -c "DROP DATABASE IF EXISTS berhot_dev;"
docker exec -e PGPASSWORD=berhot_dev_password berhot-postgres psql -U berhot -d postgres -c "CREATE DATABASE berhot_dev;"
Get-ChildItem "C:\Projects\berhot\ops\database\migrations\*.sql" | Sort-Object Name | ForEach-Object { Write-Host "Running: $($_.FullName)"; Get-Content $_.FullName -Raw | docker exec -i -e PGPASSWORD=berhot_dev_password berhot-postgres psql -U berhot -d berhot_dev }
Write-Host "Database reset complete"






pnpm --filter @berhot/email-service dev



