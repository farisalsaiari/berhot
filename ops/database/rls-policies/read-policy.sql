-- Read policies ensure tenants can only see their own data
-- These are automatically created by enable_rls_for_table()
-- This file documents the pattern for custom read policies

-- Example: Allow public API to read specific data via API key
CREATE POLICY api_key_read_loyalty ON loyalty_programs
  FOR SELECT
  USING (
    tenant_id = get_current_tenant_id()
    OR EXISTS (
      SELECT 1 FROM api_keys
      WHERE tenant_id = loyalty_programs.tenant_id
        AND 'loyalty:read' = ANY(permissions)
        AND revoked_at IS NULL
    )
  );
