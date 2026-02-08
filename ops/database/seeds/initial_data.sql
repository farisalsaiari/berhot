-- ──────────────────────────────────────────────────────────────
-- Initial Seed Data – Platform Setup
-- ──────────────────────────────────────────────────────────────

-- Insert default super admin tenant (platform operator)
INSERT INTO tenants (id, name, slug, status, plan)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Berhot Platform',
  'berhot-admin',
  'active',
  'enterprise'
) ON CONFLICT (slug) DO NOTHING;

-- Insert available products
INSERT INTO tenant_products (tenant_id, product_id, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'restaurant-pos', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'cafe-pos', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'retail-pos', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'appointment-pos', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'loyalty', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'queue-waitlist', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'marketing', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'events', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'memberships', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'shift-management', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'payroll', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'time-attendance', 'active')
ON CONFLICT (tenant_id, product_id) DO NOTHING;
