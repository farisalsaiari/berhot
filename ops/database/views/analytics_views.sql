-- Customer analytics
CREATE OR REPLACE VIEW v_customer_analytics AS
SELECT
  c.tenant_id,
  c.id AS customer_id,
  c.first_name,
  c.last_name,
  c.visit_count,
  c.total_spent,
  c.loyalty_points,
  c.loyalty_tier,
  c.last_visit_at,
  CASE
    WHEN c.last_visit_at > NOW() - INTERVAL '30 days' THEN 'active'
    WHEN c.last_visit_at > NOW() - INTERVAL '90 days' THEN 'at_risk'
    ELSE 'churned'
  END AS engagement_status
FROM customers c;

-- Hourly traffic pattern
CREATE OR REPLACE VIEW v_hourly_traffic AS
SELECT
  tenant_id,
  location_id,
  EXTRACT(DOW FROM created_at) AS day_of_week,
  EXTRACT(HOUR FROM created_at) AS hour_of_day,
  COUNT(*) AS order_count,
  SUM(total) AS revenue
FROM orders
WHERE status = 'completed'
GROUP BY tenant_id, location_id, EXTRACT(DOW FROM created_at), EXTRACT(HOUR FROM created_at);
