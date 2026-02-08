-- ──────────────────────────────────────────────────────────────
-- Berhot Platform – Row-Level Security Setup
-- This file establishes the foundation for multi-tenant isolation
-- ──────────────────────────────────────────────────────────────

-- Function to get current tenant context (set per-transaction)
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

-- Function to set tenant context (called at start of each request)
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('berhot.current_tenant_id', p_tenant_id, true);
END;
$$ LANGUAGE plpgsql;

-- Trigger function: auto-populate tenant_id on INSERT
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

-- Trigger function: auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper to enable RLS on a table with standard policies
CREATE OR REPLACE FUNCTION enable_rls_for_table(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);

  -- Tenant isolation policy
  EXECUTE format(
    'CREATE POLICY tenant_isolation_%I ON %I
     USING (tenant_id = get_current_tenant_id())
     WITH CHECK (tenant_id = get_current_tenant_id())',
    table_name, table_name
  );

  -- Auto-set tenant_id trigger
  EXECUTE format(
    'CREATE TRIGGER set_tenant_%I
     BEFORE INSERT ON %I
     FOR EACH ROW EXECUTE FUNCTION set_tenant_id_on_insert()',
    table_name, table_name
  );

  -- Auto-update updated_at trigger
  EXECUTE format(
    'CREATE TRIGGER update_timestamp_%I
     BEFORE UPDATE ON %I
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
    table_name, table_name
  );
END;
$$ LANGUAGE plpgsql;
