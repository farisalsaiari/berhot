import { type DomainEvent } from '@berhot/event-bus';
import { v4 as uuidv4 } from 'uuid';

const publishedEvents: DomainEvent[] = [];

export function createMockEventBus() {
  return {
    publish: async <T>(topic: string, tenantId: string, type: string, data: T) => {
      const event: DomainEvent<T> = {
        id: uuidv4(),
        type,
        source: 'test',
        tenantId,
        timestamp: new Date().toISOString(),
        version: 1,
        data,
      };
      publishedEvents.push(event as DomainEvent);
      return event;
    },
    getPublished: () => [...publishedEvents],
    clear: () => { publishedEvents.length = 0; },
  };
}
