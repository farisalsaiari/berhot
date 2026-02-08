export interface DomainEvent<T = unknown> {
  id: string;
  type: string;
  source: string;
  tenantId: string;
  timestamp: string;
  version: number;
  correlationId?: string;
  causationId?: string;
  data: T;
  metadata?: Record<string, unknown>;
}

export interface EventEnvelope {
  key: string;
  value: Buffer;
  headers: Record<string, string>;
  topic: string;
  partition?: number;
}

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void>;

export interface EventSubscription {
  topic: string;
  groupId: string;
  handler: EventHandler;
  options?: {
    maxRetries?: number;
    retryDelayMs?: number;
    deadLetterTopic?: string;
    concurrency?: number;
  };
}
