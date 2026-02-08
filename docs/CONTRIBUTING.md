# Contributing to Berhot

## Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start infrastructure: `make infra-up`
4. Run migrations: `make db-migrate`
5. Start services: `make dev`

## Commit Convention

We use Conventional Commits: `type(scope): message`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `infra`, `db`, `api`

## Pull Request Process

1. Create a feature branch from `develop`
2. Write tests for your changes
3. Ensure all checks pass: `make check`
4. Submit a PR with the template filled out
5. Get at least one approval from the relevant code owners

## Code Ownership

See `.github/CODEOWNERS` for team responsibilities.
