-- ──────────────────────────────────────────────────────────────
-- Loyalty Program Schema
-- ──────────────────────────────────────────────────────────────

CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'points'
    CHECK (type IN ('points', 'stamps', 'tiered', 'cashback')),
  points_per_currency DECIMAL(8,2) DEFAULT 1,
  currency_per_point DECIMAL(8,4) DEFAULT 0.01,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  name VARCHAR(100) NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  benefits JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  tier_id UUID REFERENCES loyalty_tiers(id),
  points_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  stamps_count INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  UNIQUE(tenant_id, program_id, customer_id)
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  member_id UUID NOT NULL REFERENCES loyalty_members(id),
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('earn', 'redeem', 'adjust', 'expire', 'bonus')),
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  order_id UUID REFERENCES orders(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  program_id UUID NOT NULL REFERENCES loyalty_programs(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  reward_type VARCHAR(20) NOT NULL
    CHECK (reward_type IN ('discount_percent', 'discount_fixed', 'free_item', 'custom')),
  reward_value DECIMAL(12,2),
  product_id UUID REFERENCES products(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT enable_rls_for_table('loyalty_programs');
SELECT enable_rls_for_table('loyalty_tiers');
SELECT enable_rls_for_table('loyalty_members');
SELECT enable_rls_for_table('loyalty_transactions');
SELECT enable_rls_for_table('loyalty_rewards');

CREATE INDEX idx_loyalty_members_customer ON loyalty_members(tenant_id, customer_id);
CREATE INDEX idx_loyalty_transactions_member ON loyalty_transactions(member_id, created_at DESC);
