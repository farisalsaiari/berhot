# Multi-Tenancy Guide

## Strategy

Berhot uses **shared database with Row-Level Security (RLS)** for tenant isolation.

### How It Works

1. Every tenant-scoped table has a `tenant_id` column
2. RLS policies automatically filter rows based on `berhot.current_tenant_id`
3. The tenant context is set at the beginning of each request/transaction
4. The `set_tenant_context()` function sets the PostgreSQL session variable
5. `get_current_tenant_id()` retrieves it in RLS policies

### Request Flow

```
Client → Kong → Service → Set Tenant Context → Database (RLS active)
```

### Security Guarantees

- Even a SQL injection cannot access other tenants' data (RLS enforced at DB level)
- Super admins have a separate bypass policy
- Cross-tenant access attempts are logged to audit trail

### Adding a New Table

```sql
CREATE TABLE my_new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  -- your columns here
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT enable_rls_for_table('my_new_table');
```
