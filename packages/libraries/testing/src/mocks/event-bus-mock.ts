import { type DomainEvent } from '@berhot/event-bus';

export class MockEventBus {
  private events: DomainEvent[] = [];

  async publish<T>(topic: string, tenantId: string, type: string, data: T) {
    const event: DomainEvent<T> = {
      id: `mock-${Date.now()}`,
      type, source: 'mock', tenantId,
      timestamp: new Date().toISOString(), version: 1, data,
    };
    this.events.push(event as DomainEvent);
    return event;
  }

  getEvents() { return [...this.events]; }
  getEventsByType(type: string) { return this.events.filter((e) => e.type === type); }
  clear() { this.events.length = 0; }
}
