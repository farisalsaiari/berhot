-- Atomically update inventory when an order is placed
CREATE OR REPLACE FUNCTION update_inventory_for_order(
  p_order_id UUID,
  p_tenant_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE inventory i
  SET
    quantity = i.quantity - oi.quantity,
    updated_at = NOW()
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  WHERE oi.order_id = p_order_id
    AND i.product_id = oi.product_id
    AND i.tenant_id = p_tenant_id
    AND p.track_inventory = true;

  -- Check for low stock
  INSERT INTO audit_log (tenant_id, action, resource_type, resource_id, new_values)
  SELECT
    i.tenant_id,
    'LOW_STOCK_ALERT',
    'product',
    i.product_id::TEXT,
    jsonb_build_object('quantity', i.quantity, 'threshold', i.low_stock_threshold)
  FROM inventory i
  WHERE i.tenant_id = p_tenant_id
    AND i.quantity <= i.low_stock_threshold
    AND i.quantity > 0;
END;
$$ LANGUAGE plpgsql;
