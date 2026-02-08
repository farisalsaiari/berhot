-- Migration 003: Performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created ON orders(tenant_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active ON products(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_search ON customers USING gin(
  (first_name || ' ' || last_name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone, '')) gin_trgm_ops
);
-- GIN index for JSONB searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_metadata ON orders USING gin(metadata);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_metadata ON products USING gin(metadata);
