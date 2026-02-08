import { Kafka, type ProducerConfig } from 'kafkajs';
import { type DomainEvent } from './types';
export declare class EventProducer {
    private readonly kafka;
    private readonly serviceName;
    private producer;
    private connected;
    constructor(kafka: Kafka, serviceName: string, config?: ProducerConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publish<T>(topic: string, tenantId: string, eventType: string, data: T, options?: {
        key?: string;
        correlationId?: string;
        causationId?: string;
        partition?: number;
    }): Promise<DomainEvent<T>>;
    publishBatch<T>(topic: string, events: Array<{
        tenantId: string;
        type: string;
        data: T;
        key?: string;
    }>): Promise<void>;
}
//# sourceMappingURL=producer.d.ts.map