-- Admin policy: Super admins bypass RLS for platform operations
-- Use sparingly and only for platform administration

CREATE POLICY super_admin_bypass ON tenants
  FOR ALL
  USING (
    get_current_tenant_id() = '00000000-0000-0000-0000-000000000001'
  );
