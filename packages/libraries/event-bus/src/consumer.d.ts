import { Kafka, type ConsumerConfig } from 'kafkajs';
import { type EventSubscription } from './types';
export declare class EventConsumer {
    private readonly kafka;
    private readonly groupId;
    private consumer;
    private handlers;
    private connected;
    constructor(kafka: Kafka, groupId: string, config?: Partial<ConsumerConfig>);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    subscribe(subscription: EventSubscription): Promise<void>;
    start(): Promise<void>;
    private executeWithRetry;
    private sendToDeadLetter;
}
//# sourceMappingURL=consumer.d.ts.map