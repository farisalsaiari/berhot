import { Kafka, type Producer, type ProducerConfig } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

import { type DomainEvent } from './types';
import { serializeEvent } from './serialization';

export class EventProducer {
  private producer: Producer;
  private connected = false;

  constructor(
    private readonly kafka: Kafka,
    private readonly serviceName: string,
    config?: ProducerConfig,
  ) {
    this.producer = kafka.producer(config);
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }

  async publish<T>(
    topic: string,
    tenantId: string,
    eventType: string,
    data: T,
    options?: {
      key?: string;
      correlationId?: string;
      causationId?: string;
      partition?: number;
    },
  ): Promise<DomainEvent<T>> {
    await this.connect();

    const event: DomainEvent<T> = {
      id: uuidv4(),
      type: eventType,
      source: this.serviceName,
      tenantId,
      timestamp: new Date().toISOString(),
      version: 1,
      correlationId: options?.correlationId,
      causationId: options?.causationId,
      data,
    };

    const serialized = serializeEvent(event);

    await this.producer.send({
      topic,
      messages: [
        {
          key: options?.key || tenantId,
          value: serialized,
          headers: {
            'event-id': event.id,
            'event-type': eventType,
            'tenant-id': tenantId,
            'source': this.serviceName,
            'correlation-id': options?.correlationId || '',
          },
          ...(options?.partition !== undefined ? { partition: options.partition } : {}),
        },
      ],
    });

    return event;
  }

  async publishBatch<T>(
    topic: string,
    events: Array<{ tenantId: string; type: string; data: T; key?: string }>,
  ): Promise<void> {
    await this.connect();

    const messages = events.map((e) => {
      const event: DomainEvent<T> = {
        id: uuidv4(),
        type: e.type,
        source: this.serviceName,
        tenantId: e.tenantId,
        timestamp: new Date().toISOString(),
        version: 1,
        data: e.data,
      };
      return {
        key: e.key || e.tenantId,
        value: serializeEvent(event),
        headers: {
          'event-id': event.id,
          'event-type': e.type,
          'tenant-id': e.tenantId,
        },
      };
    });

    await this.producer.send({ topic, messages });
  }
}
