-- ──────────────────────────────────────────────────────────────
-- Demo Seed Data – Sample tenant with restaurant data
-- ──────────────────────────────────────────────────────────────

-- Demo tenant
INSERT INTO tenants (id, name, slug, status, plan, settings)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Al Baik Demo Restaurant',
  'al-baik-demo',
  'active',
  'professional',
  '{"timezone": "Asia/Riyadh", "currency": "SAR", "locale": "ar-SA", "taxEnabled": true}'
) ON CONFLICT (slug) DO NOTHING;

-- Set tenant context for demo data
SELECT set_tenant_context('11111111-1111-1111-1111-111111111111');

-- Demo location
INSERT INTO locations (id, tenant_id, name, timezone, currency, tax_rate) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Main Branch - Riyadh', 'Asia/Riyadh', 'SAR', 15.00);

-- Demo categories
INSERT INTO categories (tenant_id, name, slug, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Meals', 'meals', 1),
  ('11111111-1111-1111-1111-111111111111', 'Beverages', 'beverages', 2),
  ('11111111-1111-1111-1111-111111111111', 'Extras', 'extras', 3);
