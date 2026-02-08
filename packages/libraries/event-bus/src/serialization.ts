import { type DomainEvent } from './types';

export function serializeEvent<T>(event: DomainEvent<T>): Buffer {
  return Buffer.from(JSON.stringify(event), 'utf-8');
}

export function deserializeEvent<T = unknown>(buffer: Buffer): DomainEvent<T> {
  const str = buffer.toString('utf-8');
  return JSON.parse(str) as DomainEvent<T>;
}
