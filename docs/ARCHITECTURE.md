# Architecture Overview

## System Design

Berhot is built as a modular, multi-tenant platform where each product is an independently deployable service.

### Key Principles

1. **Product Independence** – Each product (POS, Loyalty, Queue, etc.) is a separate service
2. **Tenant Isolation** – PostgreSQL RLS ensures data cannot leak between tenants
3. **Event-Driven** – Services communicate via Kafka events, not direct calls
4. **API Gateway** – Kong handles routing, rate limiting, auth validation
5. **Multi-Language** – Right tool for the job (Go for perf, NestJS for features, Python for data, Java for finance)

### Communication Patterns

- **Synchronous**: REST APIs via Kong gateway
- **Asynchronous**: Kafka events for cross-service communication
- **Internal**: Service-to-service calls via internal endpoints

### Data Architecture

- Single PostgreSQL cluster (Aurora Serverless v2)
- Row-Level Security with `tenant_id` on every table
- Redis for caching, sessions, and real-time features
- Elasticsearch for full-text search
- S3/MinIO for file storage
