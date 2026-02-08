# ──────────────────────────────────────────────────────────────
# Berhot Platform – Root Makefile
# ──────────────────────────────────────────────────────────────
.DEFAULT_GOAL := help
SHELL := /bin/bash

# ── Variables ─────────────────────────────────────────────────
COMPOSE      := docker compose
TURBO        := pnpm turbo
DC_DEV       := -f docker-compose.yml -f docker-compose.dev.yml
DC_TEST      := -f docker-compose.yml -f docker-compose.test.yml
MIGRATE      := migrate -database "$(DATABASE_URL)" -path

# ── Colors ────────────────────────────────────────────────────
CYAN   := \033[36m
GREEN  := \033[32m
YELLOW := \033[33m
RED    := \033[31m
RESET  := \033[0m

.PHONY: help
help: ## Show this help
	@echo ""
	@echo "$(CYAN)Berhot Platform$(RESET) – Available Commands"
	@echo "──────────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-22s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ──────────────────────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────────────────────
.PHONY: install
install: ## Install all dependencies
	pnpm install --frozen-lockfile
	@echo "$(GREEN)✓ Node dependencies installed$(RESET)"

.PHONY: dev
dev: ## Start full dev environment (infra + services)
	$(MAKE) infra-up
	sleep 5
	$(TURBO) dev

.PHONY: dev-services
dev-services: ## Start only application services (assumes infra running)
	$(TURBO) dev

.PHONY: build
build: ## Build all packages and services
	$(TURBO) build

.PHONY: clean
clean: ## Clean all build artifacts
	$(TURBO) clean
	find . -name "dist" -type d -prune -exec rm -rf {} +
	find . -name "build" -type d -prune -exec rm -rf {} +
	find . -name ".turbo" -type d -prune -exec rm -rf {} +
	find . -name "node_modules" -type d -prune -exec rm -rf {} +
	@echo "$(GREEN)✓ Cleaned all build artifacts$(RESET)"

# ──────────────────────────────────────────────────────────────
# Testing
# ──────────────────────────────────────────────────────────────
.PHONY: test
test: ## Run all unit tests
	$(TURBO) test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	$(TURBO) test:watch

.PHONY: test-e2e
test-e2e: ## Run end-to-end tests
	$(TURBO) test:e2e

.PHONY: test-integration
test-integration: ## Run integration tests
	$(COMPOSE) $(DC_TEST) up -d
	sleep 5
	$(TURBO) test:integration
	$(COMPOSE) $(DC_TEST) down

.PHONY: coverage
coverage: ## Generate test coverage reports
	$(TURBO) test:coverage

# ──────────────────────────────────────────────────────────────
# Code Quality
# ──────────────────────────────────────────────────────────────
.PHONY: lint
lint: ## Lint all code
	$(TURBO) lint

.PHONY: lint-fix
lint-fix: ## Lint and auto-fix
	$(TURBO) lint -- --fix

.PHONY: format
format: ## Format all code with Prettier
	pnpm prettier --write "**/*.{ts,tsx,js,jsx,json,md,yml,yaml}"

.PHONY: format-check
format-check: ## Check formatting
	pnpm prettier --check "**/*.{ts,tsx,js,jsx,json,md,yml,yaml}"

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	$(TURBO) typecheck

.PHONY: check
check: lint typecheck test ## Run all checks (lint + typecheck + test)

# ──────────────────────────────────────────────────────────────
# Infrastructure (Docker Compose)
# ──────────────────────────────────────────────────────────────
.PHONY: infra-up
infra-up: ## Start local infrastructure (Postgres, Redis, Kafka, etc.)
	$(COMPOSE) $(DC_DEV) up -d
	@echo "$(GREEN)✓ Infrastructure started$(RESET)"
	@echo "  PostgreSQL:    localhost:5432"
	@echo "  Redis:         localhost:6379"
	@echo "  Kafka:         localhost:9092"
	@echo "  Elasticsearch: localhost:9200"
	@echo "  MinIO:         localhost:9000"
	@echo "  Mailhog:       localhost:8025"
	@echo "  pgAdmin:       localhost:5050"
	@echo "  Kafka UI:      localhost:8080"

.PHONY: infra-down
infra-down: ## Stop local infrastructure
	$(COMPOSE) $(DC_DEV) down
	@echo "$(YELLOW)✓ Infrastructure stopped$(RESET)"

.PHONY: infra-reset
infra-reset: ## Reset infrastructure (destroy volumes)
	$(COMPOSE) $(DC_DEV) down -v --remove-orphans
	@echo "$(RED)✓ Infrastructure reset (volumes deleted)$(RESET)"

.PHONY: infra-logs
infra-logs: ## Tail infrastructure logs
	$(COMPOSE) $(DC_DEV) logs -f

.PHONY: infra-ps
infra-ps: ## Show infrastructure status
	$(COMPOSE) $(DC_DEV) ps

# ──────────────────────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────────────────────
.PHONY: db-migrate
db-migrate: ## Run all database migrations
	$(MIGRATE) ops/database/migrations up
	@echo "$(GREEN)✓ Migrations applied$(RESET)"

.PHONY: db-rollback
db-rollback: ## Rollback last migration
	$(MIGRATE) ops/database/migrations down 1
	@echo "$(YELLOW)✓ Last migration rolled back$(RESET)"

.PHONY: db-seed
db-seed: ## Seed database with sample data
	psql "$(DATABASE_URL)" -f ops/database/seeds/development.sql
	@echo "$(GREEN)✓ Database seeded$(RESET)"

.PHONY: db-reset
db-reset: ## Reset database (drop + recreate + migrate + seed)
	psql "$(DATABASE_URL)" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	$(MAKE) db-migrate
	$(MAKE) db-seed
	@echo "$(GREEN)✓ Database reset$(RESET)"

.PHONY: db-studio
db-studio: ## Open pgAdmin in browser
	@open http://localhost:5050

# ──────────────────────────────────────────────────────────────
# Go Services
# ──────────────────────────────────────────────────────────────
.PHONY: go-build
go-build: ## Build all Go services
	@for dir in platform/identity-access platform/tenant-management \
		products/commerce/pos-engine products/experience/loyalty \
		products/experience/queue-waitlist products/workforce/time-attendance \
		products/ecosystem/hardware; do \
		echo "$(CYAN)Building $$dir...$(RESET)"; \
		cd $$dir && go build ./... && cd $(CURDIR); \
	done
	@echo "$(GREEN)✓ All Go services built$(RESET)"

.PHONY: go-test
go-test: ## Test all Go services
	@for dir in platform/identity-access platform/tenant-management; do \
		echo "$(CYAN)Testing $$dir...$(RESET)"; \
		cd $$dir && go test ./... -v && cd $(CURDIR); \
	done

.PHONY: go-lint
go-lint: ## Lint all Go code
	golangci-lint run ./platform/identity-access/...
	golangci-lint run ./platform/tenant-management/...

# ──────────────────────────────────────────────────────────────
# Python Services
# ──────────────────────────────────────────────────────────────
.PHONY: py-setup
py-setup: ## Set up Python virtual environments
	@for dir in products/experience/marketing products/experience/reviews-feedback \
		platform/analytics-core; do \
		echo "$(CYAN)Setting up $$dir...$(RESET)"; \
		cd $$dir && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && cd $(CURDIR); \
	done

.PHONY: py-test
py-test: ## Test all Python services
	@for dir in products/experience/marketing products/experience/reviews-feedback; do \
		cd $$dir && .venv/bin/pytest && cd $(CURDIR); \
	done

# ──────────────────────────────────────────────────────────────
# Java Services
# ──────────────────────────────────────────────────────────────
.PHONY: java-build
java-build: ## Build all Java services
	cd products/workforce/payroll && ./mvnw clean package -DskipTests
	cd platform/billing-subscriptions && ./mvnw clean package -DskipTests

.PHONY: java-test
java-test: ## Test all Java services
	cd products/workforce/payroll && ./mvnw test
	cd platform/billing-subscriptions && ./mvnw test

# ──────────────────────────────────────────────────────────────
# Docker Builds
# ──────────────────────────────────────────────────────────────
.PHONY: docker-build
docker-build: ## Build all Docker images
	$(COMPOSE) build

.PHONY: docker-build-prod
docker-build-prod: ## Build production Docker images
	docker build -f deploy/docker/base-images/node.Dockerfile -t berhot/node-base:latest .
	docker build -f deploy/docker/base-images/go.Dockerfile -t berhot/go-base:latest .
	docker build -f deploy/docker/base-images/python.Dockerfile -t berhot/python-base:latest .
	docker build -f deploy/docker/base-images/java.Dockerfile -t berhot/java-base:latest .

# ──────────────────────────────────────────────────────────────
# Code Generation
# ──────────────────────────────────────────────────────────────
.PHONY: codegen
codegen: ## Generate code from contracts
	$(TURBO) codegen
	@echo "$(GREEN)✓ Code generation complete$(RESET)"

.PHONY: proto
proto: ## Generate protobuf code
	buf generate packages/contracts/protobuf

# ──────────────────────────────────────────────────────────────
# Release & Deploy
# ──────────────────────────────────────────────────────────────
.PHONY: changeset
changeset: ## Create a new changeset
	pnpm changeset

.PHONY: version
version: ## Bump versions from changesets
	pnpm changeset version

.PHONY: release
release: ## Publish packages
	pnpm changeset publish

.PHONY: deploy-staging
deploy-staging: ## Deploy to staging
	@echo "$(YELLOW)Deploying to staging...$(RESET)"
	cd deploy/terraform && terraform workspace select staging
	cd deploy/terraform && terraform apply -auto-approve

.PHONY: deploy-prod
deploy-prod: ## Deploy to production (requires confirmation)
	@echo "$(RED)⚠ Production deployment$(RESET)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	cd deploy/terraform && terraform workspace select production
	cd deploy/terraform && terraform plan
	@read -p "Apply? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	cd deploy/terraform && terraform apply
