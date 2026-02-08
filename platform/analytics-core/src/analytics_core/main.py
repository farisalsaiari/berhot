import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, Header
from typing import Optional

app = FastAPI(title="Berhot Analytics Core", version="0.1.0")

DB_URL = os.getenv("DATABASE_URL", "postgresql://berhot:berhot_dev_password@127.0.0.1:5555/berhot_dev")

def get_db():
    return psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "analytics-core"}

@app.get("/ready")
async def ready():
    try:
        conn = get_db()
        conn.close()
        return {"status": "ready"}
    except Exception as e:
        return {"status": "not ready", "error": str(e)}

@app.get("/api/v1/analytics/dashboard")
async def get_dashboard(x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID")):
    tenant_id = x_tenant_id or "10000000-0000-0000-0000-000000000001"
    conn = get_db()
    cur = conn.cursor()

    # Today's stats
    cur.execute("""
        SELECT COUNT(*) as order_count, COALESCE(SUM(total),0) as revenue, COALESCE(SUM(tax_amount),0) as tax
        FROM orders WHERE tenant_id = %s AND DATE(created_at) = CURRENT_DATE AND status = 'completed'
    """, (tenant_id,))
    today = dict(cur.fetchone())

    # Total customers
    cur.execute("SELECT COUNT(*) as total FROM customers WHERE tenant_id = %s", (tenant_id,))
    customer_count = cur.fetchone()["total"]

    # Total products
    cur.execute("SELECT COUNT(*) as total FROM products WHERE tenant_id = %s AND is_active = true", (tenant_id,))
    product_count = cur.fetchone()["total"]

    # Top products
    cur.execute("""
        SELECT oi.name, SUM(oi.quantity) as qty, SUM(oi.total_price) as revenue
        FROM order_items oi JOIN orders o ON o.id = oi.order_id
        WHERE oi.tenant_id = %s AND o.status = 'completed'
        GROUP BY oi.name ORDER BY revenue DESC LIMIT 5
    """, (tenant_id,))
    top = [dict(r) for r in cur.fetchall()]

    conn.close()
    return {
        "todayOrders": int(today["order_count"]),
        "todayRevenue": float(today["revenue"]),
        "todayTax": float(today["tax"]),
        "totalCustomers": customer_count,
        "totalActiveProducts": product_count,
        "topProducts": top,
        "currency": "SAR",
    }

@app.get("/api/v1/analytics/sales")
async def get_sales_report(period: str = "daily", x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID")):
    tenant_id = x_tenant_id or "10000000-0000-0000-0000-000000000001"
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue
        FROM orders WHERE tenant_id = %s AND status = 'completed'
        GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30
    """, (tenant_id,))
    data = [{"date": str(r["date"]), "orders": r["orders"], "revenue": float(r["revenue"])} for r in cur.fetchall()]
    conn.close()
    return {"period": period, "data": data}

@app.get("/api/v1/analytics/customers")
async def get_customer_analytics(x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID")):
    tenant_id = x_tenant_id or "10000000-0000-0000-0000-000000000001"
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT COUNT(*) as total, COALESCE(SUM(total_spent),0) as total_spent, COALESCE(AVG(total_spent),0) as avg_spent
        FROM customers WHERE tenant_id = %s
    """, (tenant_id,))
    stats = dict(cur.fetchone())
    conn.close()
    return {"totalCustomers": stats["total"], "totalSpent": float(stats["total_spent"]), "averageSpent": float(stats["avg_spent"])}

@app.get("/api/v1/analytics/products")
async def get_product_analytics(x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID")):
    tenant_id = x_tenant_id or "10000000-0000-0000-0000-000000000001"
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id, p.name, p.price, c.name as category
        FROM products p LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.tenant_id = %s AND p.is_active = true ORDER BY p.name
    """, (tenant_id,))
    products = [dict(r) for r in cur.fetchall()]
    conn.close()
    return {"products": products, "total": len(products)}
