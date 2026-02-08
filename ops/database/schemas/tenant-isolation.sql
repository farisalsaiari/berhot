-- ──────────────────────────────────────────────────────────────
-- Berhot Platform – Tenant Isolation Verification
-- Run these queries to verify RLS is working correctly
-- ──────────────────────────────────────────────────────────────

-- Verify all tenant-scoped tables have RLS enabled
CREATE OR REPLACE FUNCTION verify_rls_enabled()
RETURNS TABLE(table_name TEXT, rls_enabled BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::TEXT,
    c.relrowsecurity
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND information_schema.columns.table_name = c.relname
        AND column_name = 'tenant_id'
    )
  ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql;

-- Cross-tenant access test (should return 0 rows for wrong tenant)
-- Usage: SELECT * FROM test_tenant_isolation('tenant_a', 'tenant_b', 'orders');
CREATE OR REPLACE FUNCTION test_tenant_isolation(
  tenant_a TEXT,
  tenant_b TEXT,
  target_table TEXT
)
RETURNS INTEGER AS $$
DECLARE
  row_count INTEGER;
BEGIN
  PERFORM set_tenant_context(tenant_a);
  EXECUTE format('SELECT count(*) FROM %I WHERE tenant_id = $1', target_table)
  INTO row_count
  USING tenant_b;
  RETURN row_count;
END;
$$ LANGUAGE plpgsql;
