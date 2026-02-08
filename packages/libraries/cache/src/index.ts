import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;
  private prefix: string;

  constructor(url?: string, prefix = 'berhot') {
    this.redis = url ? new Redis(url) : new Redis();
    this.prefix = prefix;
  }

  private key(namespace: string, id: string): string {
    return `${this.prefix}:${namespace}:${id}`;
  }

  async get<T>(namespace: string, id: string): Promise<T | null> {
    const data = await this.redis.get(this.key(namespace, id));
    return data ? (JSON.parse(data) as T) : null;
  }

  async set<T>(namespace: string, id: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.setex(this.key(namespace, id), ttlSeconds, serialized);
    } else {
      await this.redis.set(this.key(namespace, id), serialized);
    }
  }

  async del(namespace: string, id: string): Promise<void> {
    await this.redis.del(this.key(namespace, id));
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(`${this.prefix}:${pattern}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /** Tenant-scoped cache: auto-prefixes with tenant ID */
  tenant(tenantId: string) {
    return {
      get: <T>(ns: string, id: string) => this.get<T>(`t:${tenantId}:${ns}`, id),
      set: <T>(ns: string, id: string, val: T, ttl?: number) => this.set(`t:${tenantId}:${ns}`, id, val, ttl),
      del: (ns: string, id: string) => this.del(`t:${tenantId}:${ns}`, id),
      invalidateAll: () => this.invalidatePattern(`t:${tenantId}:*`),
    };
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
