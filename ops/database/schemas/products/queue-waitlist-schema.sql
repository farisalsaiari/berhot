-- ──────────────────────────────────────────────────────────────
-- Queue & Waitlist Schema
-- ──────────────────────────────────────────────────────────────

CREATE TABLE queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  name VARCHAR(255) NOT NULL DEFAULT 'Main Queue',
  type VARCHAR(20) NOT NULL DEFAULT 'fifo'
    CHECK (type IN ('fifo', 'priority', 'appointment')),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  avg_wait_time INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  queue_id UUID NOT NULL REFERENCES queues(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  party_size INTEGER NOT NULL DEFAULT 1,
  priority INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'notified', 'serving', 'served', 'no_show', 'cancelled')),
  estimated_wait INTEGER,
  position INTEGER,
  notes TEXT,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

SELECT enable_rls_for_table('queues');
SELECT enable_rls_for_table('queue_entries');

CREATE INDEX idx_queue_entries_status ON queue_entries(tenant_id, queue_id, status);
CREATE INDEX idx_queue_entries_position ON queue_entries(tenant_id, queue_id, position) WHERE status = 'waiting';
