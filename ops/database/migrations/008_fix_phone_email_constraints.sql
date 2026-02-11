-- Migration 008: Fix phone uniqueness and email nullable constraints
-- Fixes:
--   1. Phone must be globally unique (not just per-tenant)
--   2. Email should be nullable (phone-only users have no email)
--   3. Email should be globally unique (not just per-tenant)

-- ── Make email nullable (phone-only users don't have email) ────
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- ── Convert empty-string emails to NULL ────────────────────────
UPDATE users SET email = NULL WHERE email = '';

-- ── Drop old tenant-scoped email unique constraint ─────────────
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tenant_id_email_key;

-- ── Add global unique constraints ──────────────────────────────
-- Email: globally unique (NULLs are allowed and don't conflict)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
  ON users (LOWER(email)) WHERE email IS NOT NULL AND status = 'active';

-- Phone: globally unique (NULLs are allowed and don't conflict)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique
  ON users (phone) WHERE phone IS NOT NULL AND status = 'active';
