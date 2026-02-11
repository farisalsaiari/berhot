-- ============================================================
-- 009_tenant_branding.sql — Logo & Cover image for tenants
-- ============================================================
-- Adds logo_url and cover_url columns to tenants table
-- for business branding (stored as file paths on disk).
-- Also adds registration_number for commercial registration.
-- ============================================================

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url      TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS cover_url     TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS registration_no VARCHAR(50);
