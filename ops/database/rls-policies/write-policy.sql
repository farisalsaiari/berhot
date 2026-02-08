-- Write policies: same tenant isolation
-- Standard write policies are created by enable_rls_for_table()
-- Custom write policies documented here

-- Example: Only managers+ can create orders above a threshold
CREATE POLICY high_value_order_write ON orders
  FOR INSERT
  WITH CHECK (
    tenant_id = get_current_tenant_id()
    AND (
      total <= 10000
      OR EXISTS (
        SELECT 1 FROM users
        WHERE id = orders.cashier_id
          AND role IN ('tenant_owner', 'tenant_admin', 'manager')
      )
    )
  );
