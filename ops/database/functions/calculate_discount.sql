-- Calculate applicable discounts for an order
CREATE OR REPLACE FUNCTION calculate_order_discount(
  p_tenant_id UUID,
  p_order_subtotal DECIMAL,
  p_customer_id UUID DEFAULT NULL,
  p_promo_code VARCHAR DEFAULT NULL
)
RETURNS TABLE(discount_amount DECIMAL, discount_type VARCHAR, description TEXT) AS $$
BEGIN
  -- Loyalty tier discount
  IF p_customer_id IS NOT NULL THEN
    RETURN QUERY
    SELECT
      CASE c.loyalty_tier
        WHEN 'gold' THEN p_order_subtotal * 0.10
        WHEN 'silver' THEN p_order_subtotal * 0.05
        WHEN 'bronze' THEN p_order_subtotal * 0.02
        ELSE 0::DECIMAL
      END,
      'loyalty_tier'::VARCHAR,
      ('Loyalty discount: ' || c.loyalty_tier)::TEXT
    FROM customers c
    WHERE c.id = p_customer_id AND c.tenant_id = p_tenant_id;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;
