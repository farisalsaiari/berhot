"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventProducer = void 0;
const uuid_1 = require("uuid");
const serialization_1 = require("./serialization");
class EventProducer {
    kafka;
    serviceName;
    producer;
    connected = false;
    constructor(kafka, serviceName, config) {
        this.kafka = kafka;
        this.serviceName = serviceName;
        this.producer = kafka.producer(config);
    }
    async connect() {
        if (!this.connected) {
            await this.producer.connect();
            this.connected = true;
        }
    }
    async disconnect() {
        if (this.connected) {
            await this.producer.disconnect();
            this.connected = false;
        }
    }
    async publish(topic, tenantId, eventType, data, options) {
        await this.connect();
        const event = {
            id: (0, uuid_1.v4)(),
            type: eventType,
            source: this.serviceName,
            tenantId,
            timestamp: new Date().toISOString(),
            version: 1,
            correlationId: options?.correlationId,
            causationId: options?.causationId,
            data,
        };
        const serialized = (0, serialization_1.serializeEvent)(event);
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
    async publishBatch(topic, events) {
        await this.connect();
        const messages = events.map((e) => {
            const event = {
                id: (0, uuid_1.v4)(),
                type: e.type,
                source: this.serviceName,
                tenantId: e.tenantId,
                timestamp: new Date().toISOString(),
                version: 1,
                data: e.data,
            };
            return {
                key: e.key || e.tenantId,
                value: (0, serialization_1.serializeEvent)(event),
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
exports.EventProducer = EventProducer;
//# sourceMappingURL=producer.js.map