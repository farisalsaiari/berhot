-- ══════════════════════════════════════════════════════════════════
-- Berhot Platform — Consolidated Initial Schema
-- Created: 2026-02-16 (replaces migrations 001–012)
-- ══════════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ══════════════════════════════════════════════════════════════════
-- RLS Foundation
-- ══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
DECLARE
  tid TEXT;
BEGIN
  tid := current_setting('berhot.current_tenant_id', true);
  IF tid IS NULL OR tid = '' THEN
    RETURN NULL;
  END IF;
  RETURN tid::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('berhot.current_tenant_id', p_tenant_id, true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_tenant_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := get_current_tenant_id();
  END IF;
  IF NEW.tenant_id IS NULL THEN
    RAISE EXCEPTION 'tenant_id is required';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION enable_rls_for_table(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);
  EXECUTE format(
    'CREATE POLICY tenant_isolation_%I ON %I
     USING (tenant_id = get_current_tenant_id())
     WITH CHECK (tenant_id = get_current_tenant_id())',
    table_name, table_name
  );
  EXECUTE format(
    'CREATE TRIGGER set_tenant_%I
     BEFORE INSERT ON %I
     FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert()',
    table_name, table_name
  );
  EXECUTE format(
    'CREATE TRIGGER update_timestamp_%I
     BEFORE UPDATE ON %I
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
    table_name, table_name
  );
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════════
-- Core Platform Tables
-- ══════════════════════════════════════════════════════════════════

-- ── Tenants ────────────────────────────────────────────────────
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('active', 'suspended', 'pending', 'trial', 'cancelled')),
  plan VARCHAR(20) NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
  settings JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  country_code VARCHAR(2) DEFAULT 'SA',
  region_id UUID,
  city_id UUID,
  logo_url TEXT,
  cover_url TEXT,
  registration_no VARCHAR(50),
  logo_shape VARCHAR(20) DEFAULT 'square',
  show_business_name BOOLEAN DEFAULT true,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'staff'
    CHECK (role IN ('super_admin', 'tenant_owner', 'tenant_admin', 'manager', 'staff', 'cashier', 'viewer')),
  status VARCHAR(30) NOT NULL DEFAULT 'pending_verification'
    CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
  phone VARCHAR(20),
  avatar_url TEXT,
  auth_provider VARCHAR(20) DEFAULT 'email'
    CHECK (auth_provider IN ('email', 'phone', 'google', 'apple')),
  last_login_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Global unique constraints for email and phone
CREATE UNIQUE INDEX idx_users_email_unique ON users (LOWER(email)) WHERE email IS NOT NULL AND status = 'active';
CREATE UNIQUE INDEX idx_users_phone_unique ON users (phone) WHERE phone IS NOT NULL AND status = 'active';

-- ── Sessions ───────────────────────────────────────────────────
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  user_agent TEXT,
  ip_address INET,
  device_info JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── API Keys ───────────────────────────────────────────────────
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tenant Products (Entitlements) ─────────────────────────────
CREATE TABLE tenant_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'trial', 'expired')),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, product_id)
);

-- ── Audit Log ──────────────────────────────────────────────────
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── OAuth Accounts ─────────────────────────────────────────────
CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'apple')),
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  raw_profile JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

-- ── OTP Codes ──────────────────────────────────────────────────
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  purpose VARCHAR(30) NOT NULL DEFAULT 'login'
    CHECK (purpose IN ('login', 'verify_email', 'verify_phone', 'reset_password')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── WebAuthn Credentials ───────────────────────────────────────
CREATE TABLE webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id BYTEA NOT NULL UNIQUE,
  public_key BYTEA NOT NULL,
  attestation_type VARCHAR(50) NOT NULL DEFAULT '',
  aaguid BYTEA,
  sign_count BIGINT NOT NULL DEFAULT 0,
  transports TEXT[] DEFAULT '{}',
  friendly_name VARCHAR(255) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- ══════════════════════════════════════════════════════════════════
-- Admin Auth (separate from customer auth)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'system_admin'
    CHECK (role IN ('super_admin', 'system_admin', 'support_agent', 'finance_admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended')),
  invited_by UUID REFERENCES admin_users(id),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  user_agent TEXT,
  ip_address VARCHAR(45),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- Partners
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE partner_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  partner_type VARCHAR(50) NOT NULL CHECK (partner_type IN ('referral', 'integration')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- Location Reference Data (Countries / Regions / Cities)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(2) NOT NULL UNIQUE,
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL DEFAULT '',
  phone_code VARCHAR(10) NOT NULL DEFAULT '',
  currency_code VARCHAR(3) NOT NULL DEFAULT '',
  flag_emoji VARCHAR(10) NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(country_id, code)
);

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(region_id, name_en)
);

-- Add FK references for tenants
ALTER TABLE tenants ADD CONSTRAINT fk_tenants_region FOREIGN KEY (region_id) REFERENCES regions(id);
ALTER TABLE tenants ADD CONSTRAINT fk_tenants_city FOREIGN KEY (city_id) REFERENCES cities(id);

-- ══════════════════════════════════════════════════════════════════
-- POS Core Schema
-- ══════════════════════════════════════════════════════════════════

-- ── Locations (Business stores/branches) ───────────────────────
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  nickname VARCHAR(255),
  location_type VARCHAR(50) DEFAULT 'physical',
  description TEXT DEFAULT '',
  address JSONB NOT NULL DEFAULT '{}',
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city_name VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Riyadh',
  currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
  tax_rate DECIMAL(5,2) DEFAULT 0,
  preferred_language VARCHAR(10) DEFAULT 'en',
  business_hours JSONB DEFAULT '{}',
  business_name_changes JSONB DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Categories ─────────────────────────────────────────────────
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID REFERENCES locations(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- ── Products / Menu Items ──────────────────────────────────────
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  category_id UUID REFERENCES categories(id),
  sku VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  cost_price DECIMAL(12,2),
  currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
  tax_rate DECIMAL(5,2),
  barcode VARCHAR(50),
  image_url TEXT,
  product_type VARCHAR(20) NOT NULL DEFAULT 'simple'
    CHECK (product_type IN ('simple', 'variant', 'combo', 'modifier_group')),
  track_inventory BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Product Variants ───────────────────────────────────────────
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  price_adjustment DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Inventory ──────────────────────────────────────────────────
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  product_id UUID NOT NULL REFERENCES products(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  low_stock_threshold DECIMAL(12,2) DEFAULT 10,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, product_id, location_id)
);

-- ── Orders ─────────────────────────────────────────────────────
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  order_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled', 'refunded')),
  order_type VARCHAR(20) NOT NULL DEFAULT 'dine_in'
    CHECK (order_type IN ('dine_in', 'takeout', 'delivery', 'drive_through', 'online')),
  customer_id UUID,
  cashier_id UUID REFERENCES users(id),
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, order_number)
);

-- ── Order Items ────────────────────────────────────────────────
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_price DECIMAL(12,2) NOT NULL,
  notes TEXT,
  modifiers JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Payments ───────────────────────────────────────────────────
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  method VARCHAR(30) NOT NULL
    CHECK (method IN ('cash', 'card', 'mobile_pay', 'loyalty_points', 'split', 'online')),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  reference VARCHAR(255),
  gateway_response JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Customers ──────────────────────────────────────────────────
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier VARCHAR(20) DEFAULT 'bronze',
  total_spent DECIMAL(12,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  last_visit_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Cash Drawers ───────────────────────────────────────────────
CREATE TABLE cash_drawers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  opened_by UUID NOT NULL REFERENCES users(id),
  closed_by UUID REFERENCES users(id),
  opening_amount DECIMAL(12,2) NOT NULL,
  closing_amount DECIMAL(12,2),
  expected_amount DECIMAL(12,2),
  difference DECIMAL(12,2),
  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  notes TEXT
);

-- ── Shifts ─────────────────────────────────────────────────────
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'scheduled',
  break_duration INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Attendance ─────────────────────────────────────────────────
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  clock_in_method VARCHAR(20) DEFAULT 'manual'
    CHECK (clock_in_method IN ('manual', 'fingerprint', 'face', 'nfc', 'geofence')),
  clock_out_method VARCHAR(20),
  total_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- Enable RLS on tenant-scoped tables
-- ══════════════════════════════════════════════════════════════════

SELECT enable_rls_for_table('users');
SELECT enable_rls_for_table('sessions');
SELECT enable_rls_for_table('api_keys');
SELECT enable_rls_for_table('tenant_products');
SELECT enable_rls_for_table('audit_log');
SELECT enable_rls_for_table('locations');
SELECT enable_rls_for_table('categories');
SELECT enable_rls_for_table('products');
SELECT enable_rls_for_table('product_variants');
SELECT enable_rls_for_table('inventory');
SELECT enable_rls_for_table('orders');
SELECT enable_rls_for_table('order_items');
SELECT enable_rls_for_table('payments');
SELECT enable_rls_for_table('customers');
SELECT enable_rls_for_table('cash_drawers');
SELECT enable_rls_for_table('shifts');
SELECT enable_rls_for_table('attendance_records');

-- ══════════════════════════════════════════════════════════════════
-- Indexes
-- ══════════════════════════════════════════════════════════════════

-- Users
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_status ON users(tenant_id, status);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

-- Sessions
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at) WHERE revoked_at IS NULL;

-- API Keys
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- Tenant Products
CREATE INDEX idx_tenant_products_tenant ON tenant_products(tenant_id);

-- Audit Log
CREATE INDEX idx_audit_log_tenant ON audit_log(tenant_id, created_at DESC);
CREATE INDEX idx_audit_log_resource ON audit_log(tenant_id, resource_type, resource_id);

-- OAuth
CREATE INDEX idx_oauth_accounts_user ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider, provider_user_id);

-- OTP
CREATE INDEX idx_otp_codes_identifier ON otp_codes(identifier, purpose, created_at DESC);
CREATE INDEX idx_otp_codes_expires ON otp_codes(expires_at) WHERE verified_at IS NULL;

-- WebAuthn
CREATE INDEX idx_webauthn_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX idx_webauthn_user_id ON webauthn_credentials(user_id);

-- Admin
CREATE INDEX idx_admin_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at) WHERE revoked_at IS NULL;
CREATE INDEX idx_admin_audit_admin ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX idx_admin_audit_action ON admin_audit_log(action, created_at DESC);

-- Partners
CREATE INDEX idx_partner_apps_email ON partner_applications(email);
CREATE INDEX idx_partner_apps_status ON partner_applications(status);
CREATE INDEX idx_partner_apps_type ON partner_applications(partner_type);
CREATE INDEX idx_partner_apps_created ON partner_applications(created_at DESC);

-- Location reference data
CREATE INDEX idx_regions_country_id ON regions(country_id);
CREATE INDEX idx_cities_region_id ON cities(region_id);
CREATE INDEX idx_cities_country_id ON cities(country_id);
CREATE INDEX idx_countries_active ON countries(is_active) WHERE is_active = true;
CREATE INDEX idx_regions_active ON regions(is_active) WHERE is_active = true;
CREATE INDEX idx_cities_active ON cities(is_active) WHERE is_active = true;

-- POS Core
CREATE INDEX idx_locations_tenant_status ON locations(tenant_id, status);
CREATE INDEX idx_locations_tenant_name ON locations(tenant_id, name);
CREATE INDEX idx_products_tenant_category ON products(tenant_id, category_id);
CREATE INDEX idx_products_sku ON products(tenant_id, sku);
CREATE INDEX idx_products_barcode ON products(tenant_id, barcode);
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_location ON orders(tenant_id, location_id, created_at DESC);
CREATE INDEX idx_orders_customer ON orders(tenant_id, customer_id);
CREATE INDEX idx_orders_created ON orders(tenant_id, created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_customers_phone ON customers(tenant_id, phone);
CREATE INDEX idx_customers_email ON customers(tenant_id, email);
CREATE INDEX idx_inventory_product ON inventory(tenant_id, product_id);

-- Shifts & Attendance
CREATE INDEX idx_shifts_user ON shifts(tenant_id, user_id, start_time);
CREATE INDEX idx_attendance_user ON attendance_records(tenant_id, user_id, clock_in);
