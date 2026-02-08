import { Kafka, type Consumer, type ConsumerConfig, type EachMessagePayload } from 'kafkajs';

import { type DomainEvent, type EventHandler, type EventSubscription } from './types';
import { deserializeEvent } from './serialization';

export class EventConsumer {
  private consumer: Consumer;
  private handlers = new Map<string, EventHandler[]>();
  private connected = false;

  constructor(
    private readonly kafka: Kafka,
    private readonly groupId: string,
    config?: Partial<ConsumerConfig>,
  ) {
    this.consumer = kafka.consumer({ groupId, ...config });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.consumer.connect();
      this.connected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.consumer.disconnect();
      this.connected = false;
    }
  }

  async subscribe(subscription: EventSubscription): Promise<void> {
    await this.connect();
    await this.consumer.subscribe({ topic: subscription.topic, fromBeginning: false });

    const existing = this.handlers.get(subscription.topic) || [];
    existing.push(subscription.handler);
    this.handlers.set(subscription.topic, existing);
  }

  async start(): Promise<void> {
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, message } = payload;
        const handlers = this.handlers.get(topic) || [];

        if (!message.value) {
          return;
        }

        const event = deserializeEvent(message.value);

        for (const handler of handlers) {
          try {
            await this.executeWithRetry(handler, event, 3);
          } catch (error) {
            console.error(`Handler failed for event ${event.id} on topic ${topic}:`, error);
            // Send to dead letter topic
            await this.sendToDeadLetter(topic, event, error as Error);
          }
        }
      },
    });
  }

  private async executeWithRetry(
    handler: EventHandler,
    event: DomainEvent,
    maxRetries: number,
    attempt = 1,
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetry(handler, event, maxRetries, attempt + 1);
      }
      throw error;
    }
  }

  private async sendToDeadLetter(
    originalTopic: string,
    event: DomainEvent,
    error: Error,
  ): Promise<void> {
    console.error(`Dead letter: ${originalTopic} event ${event.id}`, {
      error: error.message,
      eventType: event.type,
      tenantId: event.tenantId,
    });
  }
}
