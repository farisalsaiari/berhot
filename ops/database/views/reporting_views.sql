-- Daily sales summary per tenant/location
CREATE OR REPLACE VIEW v_daily_sales AS
SELECT
  tenant_id,
  location_id,
  DATE(created_at) AS sale_date,
  COUNT(*) AS order_count,
  SUM(subtotal) AS total_subtotal,
  SUM(tax_amount) AS total_tax,
  SUM(total) AS total_revenue,
  AVG(total) AS avg_order_value
FROM orders
WHERE status = 'completed'
GROUP BY tenant_id, location_id, DATE(created_at);

-- Top products per tenant
CREATE OR REPLACE VIEW v_top_products AS
SELECT
  oi.tenant_id,
  oi.product_id,
  p.name AS product_name,
  SUM(oi.quantity) AS total_sold,
  SUM(oi.total_price) AS total_revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
GROUP BY oi.tenant_id, oi.product_id, p.name;
