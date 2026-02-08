# Berhot Platform

A multi-tenant SaaS platform powering point-of-sale, loyalty, queue management, workforce, and business management.

## Architecture

- **Monorepo** managed with Turborepo + pnpm workspaces
- **Multi-language**: Go (high-perf), Node.js/NestJS (feature-rich), Python (analytics/ML), Java (financial)
- **Multi-tenant** with PostgreSQL Row-Level Security (RLS)
- **Event-driven** via Apache Kafka (KRaft mode)
- **Kubernetes** deployment with Helm charts

## Products

| Product | Language | Description |
|---------|----------|-------------|
| POS Engine | Go | Core transaction processing |
| Restaurant POS | NestJS + React | Full-service restaurant operations |
| Cafe POS | NestJS + React | Cafe/coffee shop operations |
| Retail POS | NestJS + React | Inventory-focused retail |
| Appointment POS | NestJS + React | Service booking + POS |
| Food Truck POS | React | Food truck operations |
| Grocery POS | React | Grocery store operations |
| Quick Service POS | React | Quick service restaurants |
| Supermarket POS | React | Supermarket operations |
| Loyalty | Go + React | Points, tiers, rewards |
| Queue/Waitlist | Go + React | Real-time queue with WebSocket |
| Marketing | Python | Campaigns, audiences, analytics |
| Reviews & Feedback | Python | Review system |
| Shift Management | NestJS + React | Employee scheduling |
| Payroll | Java | Salary calculation, compliance |
| Time Attendance | Go + React | Biometric time tracking |
| Event Management | NestJS + React | Event creation and ticketing |
| Memberships | NestJS + React | Subscription management |
| Marketplace | NestJS | App marketplace |

---

## Prerequisites

Install the following tools on your machine before proceeding:

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | >= 20.0.0 | https://nodejs.org or `nvm install 20` |
| **pnpm** | >= 9.0.0 | `npm install -g pnpm@9.15.4` |
| **Docker Desktop** | Latest | https://www.docker.com/products/docker-desktop |
| **Go** | >= 1.21 | https://go.dev/dl |
| **Python** | >= 3.11 | https://www.python.org/downloads |
| **Java JDK** | >= 17 | https://adoptium.net |
| **Make** | Any | Pre-installed on macOS/Linux. Windows: install via `choco install make` or use WSL |
| **Git** | Latest | https://git-scm.com |

### Windows Users

If you are on Windows, it is **strongly recommended** to use **WSL2** (Windows Subsystem for Linux) for the best experience, since the Makefile and shell scripts are bash-based.

```powershell
# Install WSL2 (run in PowerShell as Admin)
wsl --install

# Then work inside WSL for all commands below
```

Alternatively, use **Git Bash** or install `make` via Chocolatey:

```powershell
choco install make
```

---

## Getting Started (New Machine - Full Setup)

Follow these steps in order from a fresh clone:

### Step 1: Clone the Repository

```bash
git clone <repository-url> berhot
cd berhot
```

### Step 2: Set Up Environment Variables

```bash
# Copy the example env file
cp config/.env.example .env

# Edit .env and fill in your values (the defaults work for local development)
```

Key defaults for local development (no changes needed):

| Variable | Default Value |
|----------|---------------|
| `POSTGRES_HOST` | `localhost` |
| `POSTGRES_PORT` | `5432` |
| `POSTGRES_USER` | `berhot` |
| `POSTGRES_PASSWORD` | `berhot_dev_password` |
| `POSTGRES_DB` | `berhot_dev` |
| `REDIS_HOST` | `localhost` |
| `REDIS_PORT` | `6379` |
| `KAFKA_BROKERS` | `localhost:9092` |
| `ELASTICSEARCH_URL` | `http://localhost:9200` |

> **Note:** For third-party services (Stripe, Twilio, Firebase, Google OAuth), fill in your own API keys in `.env`.

### Step 3: Install Node.js Dependencies

```bash
pnpm install
```

This installs all workspace dependencies across the monorepo using pnpm workspaces.

### Step 4: Start Docker Infrastructure

```bash
# Start all infrastructure services (PostgreSQL, Redis, Kafka, Elasticsearch, MongoDB, MinIO, Nginx, MailHog)
pnpm docker:up
```

Or using Make:

```bash
make infra-up
```

Wait for all containers to be healthy. You can verify with:

```bash
docker ps
```

**Infrastructure services and their ports:**

| Service | Port | UI/Dashboard |
|---------|------|-------------|
| PostgreSQL | `5555` (mapped to 5432) | - |
| Redis | `6379` | - |
| Kafka | `9092` | - |
| Elasticsearch | `9200` | - |
| MongoDB | `27017` | - |
| MinIO (S3) | `9000` (API), `9001` (Console) | http://localhost:9001 |
| Nginx | `80`, `443` | - |
| MailHog | `1025` (SMTP), `8025` (UI) | http://localhost:8025 |
| pgAdmin | `5050` | http://localhost:5050 |
| Kafka UI | `8080` | http://localhost:8080 |
| Redis Commander | `8081` | http://localhost:8081 |
| Prometheus | `9090` | http://localhost:9090 |
| Grafana | `3001` | http://localhost:3001 |
| Jaeger (Tracing) | `16686` | http://localhost:16686 |
| Loki (Logs) | `3100` | - |
| Kong Gateway | `8000` (Proxy), `8001` (Admin) | - |

**Default credentials for dev dashboards:**

| Dashboard | Username | Password |
|-----------|----------|----------|
| pgAdmin | `admin@berhot.dev` | `admin` |
| Grafana | `admin` | `admin` |
| MinIO Console | `minio_access` | `minio_secret` |

### Step 5: Run Database Migrations

```bash
make db-migrate
```

### Step 6: Seed the Database (Optional)

```bash
make db-seed
```

### Step 7: Set Up Go Services

```bash
# Build all Go services (identity-access, tenant-management, pos-engine, etc.)
make go-build
```

### Step 8: Set Up Python Services

```bash
# Create virtual environments and install dependencies for Python services
make py-setup
```

### Step 9: Set Up Java Services

```bash
# Build Java services (billing-subscriptions, payroll)
make java-build
```

### Step 10: Build All Packages

```bash
pnpm build
# or
make build
```

### Step 11: Start Development

```bash
# Start everything (infrastructure + all services)
make dev
```

---

## Quick Start (Returning Developer)

If infrastructure is already set up and you just need to start working:

```bash
# 1. Install/update dependencies
pnpm install

# 2. Start infrastructure
pnpm docker:up

# 3. Start all dev servers
pnpm dev
```

---

## Running Specific Products

You don't have to run everything. Use these commands to run only what you need:

```bash
# All commerce POS products
pnpm dev:commerce

# Specific POS apps
pnpm dev:restaurant        # Restaurant POS only
pnpm dev:cafe              # Cafe POS only
pnpm dev:retail            # Retail POS only

# Product domains
pnpm dev:experience        # Loyalty, Queue, Marketing, Reviews
pnpm dev:engagement        # Events, Memberships
pnpm dev:workforce         # Shifts, Time Attendance, Payroll

# Platform services
pnpm dev:platform          # Notifications, Integrations, File Service

# Website apps
pnpm dev:landing           # Landing App (port 3000)
pnpm dev:marketing         # Marketing Website (port 3013)

# Dashboard & Admin
pnpm dev:dashboard         # Merchant Dashboard
pnpm dev:admin             # Admin Console
```

---

## Running Backend Services

The frontend apps proxy `/api` requests to the backend. To test real features (sign-in, data, etc.), you need the infrastructure + backend services running.

### Quick Start: Backend Only

```bash
# 1. Open Docker Desktop and wait for it to fully start

# 2. Start Docker infrastructure (Postgres, Redis, Kafka, Mailhog, etc.)
pnpm docker:up

# 3. Wait for containers to be healthy
docker ps

# 4. Run database migrations
make db-migrate               # Linux/Mac/WSL
# or manually run migration scripts if make is not installed (Windows)

# 5. Seed the database (optional - adds demo data)
make db-seed

# 6. Start the auth service (Go - runs on port 8080)
cd platform/identity-access
cp .env.example .env
make run                      # Linux/Mac/WSL
go run ./cmd/server/main.go   # Windows PowerShell (no make needed)
```

### Backend Services Overview

| Service | Language | Port | Directory | Dev Command |
|---------|----------|------|-----------|-------------|
| **Identity-Access (Auth)** | Go / Gin | `8080` | `platform/identity-access` | `make run` or `go run ./cmd/server/main.go` |
| **Tenant Management** | Go / Gin | `8080` | `platform/tenant-management` | `make run` or `go run ./cmd/server/main.go` |
| **POS Engine** | Go / Gin | `8080` | `platform/pos-engine` | `make run` or `go run ./cmd/server/main.go` |
| **Webhook Service** | Go / Gin | `8080` | `platform/webhook-service` | `make run` or `go run ./cmd/server/main.go` |
| **Search Engine** | Go / Gin | `8080` | `platform/search-engine` | `make run` or `go run ./cmd/server/main.go` |
| **Audit Trail** | Go / Gin | `8080` | `platform/audit-trail` | `make run` or `go run ./cmd/server/main.go` |
| **Notification Center** | NestJS | `3000` | `platform/notification-center` | `pnpm dev` |
| **Integration Hub** | NestJS | `3000` | `platform/integration-hub` | `pnpm dev` |
| **File Service** | NestJS | `3012` | `platform/file-service` | `pnpm dev` |
| **Analytics Core** | Python / FastAPI | `8000` | `platform/analytics-core` | `uvicorn main:app --reload` |
| **Billing & Subscriptions** | Java / Spring Boot | `8080` | `platform/billing-subscriptions` | `./mvnw spring-boot:run` |

### Running the Auth Service (Identity-Access)

This is the most important service for testing sign-in, sign-up, OTP, and OAuth:

```bash
cd platform/identity-access

# Copy env and configure
cp .env.example .env

# Run the service
make run                      # Linux/Mac/WSL
go run ./cmd/server/main.go   # Windows PowerShell (no make needed)
```

The auth service runs on **port 8080**. The frontend Vite config proxies `/api` requests to `http://localhost:8080`.

**Auth `.env` key variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | `8080` | Auth service port |
| `DATABASE_URL` | `postgresql://berhot:berhot_dev_password@localhost:5555/berhot_dev?sslmode=disable` | Postgres connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis for sessions/cache |
| `JWT_SECRET` | `dev-secret-change-me` | JWT signing key |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed frontend origins (update for all ports) |
| `GOOGLE_CLIENT_ID` | _(empty)_ | Google OAuth (optional) |
| `SMTP_HOST` | `localhost` | Mailhog SMTP |
| `SMTP_PORT` | `1025` | Mailhog SMTP port |

**Update CORS_ORIGINS** in the auth `.env` to allow all frontend ports:

```
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005,http://localhost:3006,http://localhost:3007,http://localhost:3008,http://localhost:3009,http://localhost:3010,http://localhost:3011,http://localhost:3012,http://localhost:3013,http://localhost:5001,http://localhost:5002,http://localhost:5003,http://localhost:5004,http://localhost:5005,http://localhost:5006,http://localhost:5007,http://localhost:5008,http://localhost:5009,http://localhost:5010,http://localhost:5011,http://localhost:5012,http://localhost:5013,http://localhost:5014
```

### Running Python Services (Analytics)

```bash
cd platform/analytics-core
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate        # Linux/Mac
# .venv\Scripts\activate         # Windows

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Running Java Services (Billing)

```bash
cd platform/billing-subscriptions
./mvnw spring-boot:run
```

### Running NestJS Services

```bash
# Notification Center
cd platform/notification-center && pnpm dev

# Integration Hub
cd platform/integration-hub && pnpm dev

# File Service
cd platform/file-service && pnpm dev
```

### API Gateway (Kong)

Kong routes API requests to the correct backend service. It starts automatically with Docker:

| Route Pattern | Backend Service |
|--------------|----------------|
| `/api/v1/auth/*` | identity-access (port 8080) |
| `/api/v1/users/*` | identity-access (port 8080) |
| `/api/v1/tenants/*` | tenant-management (port 8080) |
| `/api/v1/pos/*` | pos-engine (port 8080) |
| `/api/v1/notifications/*` | notification-center (port 3000) |
| `/api/v1/analytics/*` | analytics-core (port 8000) |

> **Note:** In local development, the frontend Vite proxy sends `/api` directly to `http://localhost:8080` (identity-access), bypassing Kong. Kong is used in staging/production.

### Dev Dashboard UIs

After running `pnpm docker:up`, these UIs are available:

| Tool | URL | Purpose |
|------|-----|---------|
| **MailHog** | http://localhost:8025 | View OTP emails, password resets |
| **pgAdmin** | http://localhost:5050 | Browse database tables |
| **Kafka UI** | http://localhost:8080 | Inspect event topics |
| **Redis Commander** | http://localhost:8081 | View cached sessions |
| **Grafana** | http://localhost:3001 | Monitoring dashboards |
| **Jaeger** | http://localhost:16686 | Distributed tracing |
| **MinIO Console** | http://localhost:9001 | File storage browser |

### Full Stack Test Flow (Sign-In Example)

```bash
# Terminal 1: Start infrastructure
pnpm docker:up

# Terminal 2: Run database setup
make db-migrate && make db-seed

# Terminal 3: Start auth service
cd platform/identity-access && cp .env.example .env
make run                      # Linux/Mac/WSL
go run ./cmd/server/main.go   # Windows PowerShell

# Terminal 4: Start frontend (landing app)
cd platform/apps/landing-app && pnpm dev

# Now visit http://localhost:3000/en/signin
# OTP emails appear at http://localhost:8025 (MailHog)
```

---

## App Port Allocation

Every app has a dedicated dev port and preview port to avoid conflicts when running multiple apps simultaneously.

### Product Apps (Vite + React)

| App | Dev Port | Preview Port | Dev URL | Preview URL |
|-----|----------|-------------|---------|-------------|
| Landing App | `3000` | `5001` | http://localhost:3000 | http://localhost:5001 |
| Restaurant POS | `3001` | `5002` | http://localhost:3001 | http://localhost:5002 |
| Cafe POS | `3002` | `5003` | http://localhost:3002 | http://localhost:5003 |
| Retail POS | `3003` | `5004` | http://localhost:3003 | http://localhost:5004 |
| Appointment POS | `3004` | `5005` | http://localhost:3004 | http://localhost:5005 |
| Loyalty | `3005` | `5006` | http://localhost:3005 | http://localhost:5006 |
| Queue/Waitlist | `3006` | `5007` | http://localhost:3006 | http://localhost:5007 |
| Marketing App | `3007` | `5008` | http://localhost:3007 | http://localhost:5008 |
| Shift Management | `3008` | `5009` | http://localhost:3008 | http://localhost:5009 |
| Memberships | `3009` | `5010` | http://localhost:3009 | http://localhost:5010 |
| Event Management | `3010` | `5011` | http://localhost:3010 | http://localhost:5011 |
| Time Attendance | `3011` | `5012` | http://localhost:3011 | http://localhost:5012 |
| POS Terminal | `3012` | `5013` | http://localhost:3012 | http://localhost:5013 |
| Marketing Website | `3013` | `5014` | http://localhost:3013 | http://localhost:5014 |

### Platform Apps (Next.js)

| App | Dev Port | Dev URL |
|-----|----------|---------|
| Merchant Dashboard | `3020` | http://localhost:3020 |
| Admin Console | `3021` | http://localhost:3021 |
| Developer Portal | `3022` | http://localhost:3022 |
| Customer Support | `3023` | http://localhost:3023 |
| Compliance Portal | `3024` | http://localhost:3024 |

### Running Preview (Production Build)

Preview serves the built production bundle locally, useful for testing before deploying.

```bash
# 1. Build first, then preview all apps
pnpm build
pnpm preview

# Preview by domain
pnpm preview:commerce          # All commerce POS apps
pnpm preview:experience        # Loyalty, Queue, Marketing
pnpm preview:engagement        # Events, Memberships
pnpm preview:workforce         # Shifts, Time Attendance

# Preview a specific app
pnpm preview:restaurant        # http://localhost:5002
pnpm preview:cafe              # http://localhost:5003
pnpm preview:retail            # http://localhost:5004
pnpm preview:landing           # http://localhost:5001
pnpm preview:marketing         # http://localhost:5014
```

---

## Docker Commands

```bash
# Start infrastructure
pnpm docker:up

# Stop infrastructure
pnpm docker:down

# View logs
pnpm docker:logs

# Check running containers
docker ps

# Reset infrastructure (WARNING: deletes all data volumes)
make infra-reset

# Build all Docker images
make docker-build

# Build production Docker images
make docker-build-prod
```

---

## Database Commands

```bash
# Run migrations
make db-migrate

# Rollback last migration
make db-rollback

# Seed development data
make db-seed

# Full reset (drop + recreate + migrate + seed)
make db-reset

# Open pgAdmin in browser
make db-studio
```

---

## Testing

```bash
# Run all unit tests
pnpm test
# or
make test

# Run tests in watch mode
make test-watch

# Run integration tests (starts test infrastructure automatically)
make test-integration

# Run end-to-end tests
pnpm test:e2e

# Run tests for specific domain
pnpm test:commerce
pnpm test:experience

# Run tests only for changed files
pnpm test:affected

# Generate coverage reports
make coverage

# Go tests
make go-test

# Python tests
make py-test

# Java tests
make java-test
```

---

## Building

```bash
# Build all packages and services
pnpm build
# or
make build

# Build only affected packages (based on git changes)
pnpm build:affected

# Build Go services
make go-build

# Build Java services
make java-build

# TypeScript type checking
pnpm typecheck
# or
make typecheck
```

---

## Code Quality

```bash
# Lint all code
pnpm lint
# or
make lint

# Lint and auto-fix
pnpm lint:fix
# or
make lint-fix

# Format code with Prettier
pnpm format

# Check formatting
pnpm format:check

# Run all checks (lint + typecheck + test)
make check
```

---

## Code Generation

```bash
# Generate API clients from OpenAPI specs
pnpm generate:api-client

# Generate protobuf code
pnpm generate:proto
# or
make proto

# Run all code generation
make codegen
```

---

## Project Structure

```
berhot/
├── config/                        # Shared configs (.env, eslint, tsconfig, prettier)
├── deploy/
│   ├── docker/                    # Docker Compose files (base + dev + test)
│   ├── kubernetes/                # K8s manifests
│   └── terraform/                 # Infrastructure as Code
├── docs/                          # Documentation
├── ops/
│   └── database/
│       ├── migrations/            # Database migrations
│       ├── schemas/               # SQL schemas
│       ├── seeds/                 # Seed data
│       ├── rls-policies/          # Row-Level Security policies
│       └── views/                 # Database views
├── packages/
│   ├── ui/                        # Base UI component library
│   ├── ui-components/             # Shared component library
│   ├── ui-pos/                    # POS-specific UI components
│   ├── i18n/                      # Internationalization
│   ├── contracts/                 # OpenAPI specs, Protobuf, Event schemas
│   ├── libraries/                 # 21 shared NPM packages
│   │   ├── auth-utils/
│   │   ├── backend-common/
│   │   ├── cache/
│   │   ├── database/
│   │   ├── event-bus/
│   │   ├── logging/
│   │   ├── tenancy/
│   │   └── ...
│   └── sdks/                      # Client SDKs (JS, Go, Python, Java, Flutter)
├── platform/                      # Core platform services
│   ├── identity-access/           # Auth & users (Go)
│   ├── tenant-management/         # Multi-tenancy (Go)
│   ├── billing-subscriptions/     # Plans & billing (Java/Spring Boot)
│   ├── notification-center/       # Email/SMS/push (NestJS)
│   ├── integration-hub/           # External integrations (NestJS)
│   ├── file-service/              # File uploads (NestJS)
│   ├── analytics-core/            # Analytics engine (Python/FastAPI)
│   ├── pos-engine/                # Core POS processing (Go)
│   ├── audit-trail/               # Audit logging (Go)
│   ├── apps/                      # Platform frontend apps
│   └── internal/                  # Internal tools (admin, support, compliance)
├── products/
│   ├── commerce/                  # 8 POS variants (app + service each)
│   │   ├── restaurant-pos/
│   │   ├── cafe-pos/
│   │   ├── retail-pos/
│   │   ├── appointment-pos/
│   │   ├── food-truck-pos/
│   │   ├── grocery-pos/
│   │   ├── quick-service-pos/
│   │   └── supermarket-pos/
│   ├── experience/                # Loyalty, Queue, Marketing, Reviews
│   ├── engagement/                # Events, Memberships
│   ├── workforce/                 # Shifts, Payroll, Time Attendance
│   └── ecosystem/                 # Hardware, Marketplace, Integrations
├── runtime/                       # Runtime configs (Kong, Nginx, Prometheus, Grafana)
├── scripts/                       # Automation scripts (setup, deploy, seed, test)
├── Makefile                       # Build automation
├── package.json                   # Root workspace config
├── pnpm-workspace.yaml            # pnpm workspace definitions
└── turbo.json                     # Turborepo build pipeline
```

---

## Multi-Tenancy

Every database table includes `tenant_id` with RLS policies ensuring complete data isolation. See `ops/database/rls-policies/`.

## Public API

External POS systems can integrate with Berhot services via:
- `/api/v1/public/loyalty/*` -- Loyalty points check/earn/redeem
- `/api/v1/public/queue/*` -- Queue join/check/cancel

Authenticated with API keys (`X-API-Key` header).

---

## Release & Deploy

```bash
# Create a changeset (for versioning)
pnpm changeset

# Bump versions
pnpm version

# Publish packages
pnpm release

# Deploy to staging
make deploy-staging

# Deploy to production (interactive confirmation required)
make deploy-prod
```

---

## Troubleshooting

### Docker containers won't start
```bash
# Check if ports are already in use
docker ps -a
# Reset everything
make infra-reset
pnpm docker:up
```

### pnpm install fails
```bash
# Clear pnpm cache
pnpm store prune
# Remove node_modules and reinstall
make clean
pnpm install
```

### Database connection issues
```bash
# Verify PostgreSQL is running
docker ps | grep postgres
# Check logs
docker logs berhot-postgres
# PostgreSQL is exposed on port 5555 (not 5432)
# Connection string: postgresql://berhot:berhot_dev_password@localhost:5555/berhot_dev
```

### Kafka issues
```bash
# Check Kafka health
docker logs berhot-kafka
# Open Kafka UI to inspect topics
# http://localhost:8080
```

### Go build fails
```bash
# Ensure Go is installed
go version
# Download Go modules
cd platform/identity-access && go mod download
```

### Python setup fails
```bash
# Ensure Python 3.11+ is installed
python3 --version
# Manual venv setup
cd platform/analytics-core
python3 -m venv .venv
source .venv/bin/activate    # Linux/Mac
# .venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### Java build fails
```bash
# Ensure JDK 17+ is installed
java -version
# Use the Maven wrapper (no need to install Maven separately)
cd platform/billing-subscriptions
./mvnw clean package -DskipTests
```

---

## Full Command Reference

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all Node.js dependencies |
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all code |
| `pnpm docker:up` | Start Docker infrastructure |
| `pnpm docker:down` | Stop Docker infrastructure |
| `pnpm docker:logs` | Tail infrastructure logs |
| `make dev` | Start infra + all dev servers |
| `make build` | Build all packages |
| `make test` | Run all unit tests |
| `make infra-up` | Start infrastructure only |
| `make infra-down` | Stop infrastructure |
| `make infra-reset` | Reset infra (delete volumes) |
| `make db-migrate` | Run database migrations |
| `make db-seed` | Seed database |
| `make db-reset` | Full database reset |
| `make go-build` | Build Go services |
| `make go-test` | Test Go services |
| `make py-setup` | Setup Python environments |
| `make py-test` | Test Python services |
| `make java-build` | Build Java services |
| `make java-test` | Test Java services |
| `make docker-build` | Build all Docker images |
| `make check` | Run lint + typecheck + test |
| `make clean` | Clean all build artifacts |
| `make help` | Show all available make commands |
