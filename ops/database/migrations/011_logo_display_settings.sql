-- ============================================================
-- 011_logo_display_settings.sql — Logo display preferences
-- ============================================================
-- Adds logo_shape (square|circle|rectangle) and
-- show_business_name (boolean) to tenants table
-- for sidebar branding customization.
-- ============================================================

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_shape         VARCHAR(20) DEFAULT 'square';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS show_business_name BOOLEAN     DEFAULT true;
