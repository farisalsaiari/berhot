"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConsumer = void 0;
const serialization_1 = require("./serialization");
class EventConsumer {
    kafka;
    groupId;
    consumer;
    handlers = new Map();
    connected = false;
    constructor(kafka, groupId, config) {
        this.kafka = kafka;
        this.groupId = groupId;
        this.consumer = kafka.consumer({ groupId, ...config });
    }
    async connect() {
        if (!this.connected) {
            await this.consumer.connect();
            this.connected = true;
        }
    }
    async disconnect() {
        if (this.connected) {
            await this.consumer.disconnect();
            this.connected = false;
        }
    }
    async subscribe(subscription) {
        await this.connect();
        await this.consumer.subscribe({ topic: subscription.topic, fromBeginning: false });
        const existing = this.handlers.get(subscription.topic) || [];
        existing.push(subscription.handler);
        this.handlers.set(subscription.topic, existing);
    }
    async start() {
        await this.consumer.run({
            eachMessage: async (payload) => {
                const { topic, message } = payload;
                const handlers = this.handlers.get(topic) || [];
                if (!message.value) {
                    return;
                }
                const event = (0, serialization_1.deserializeEvent)(message.value);
                for (const handler of handlers) {
                    try {
                        await this.executeWithRetry(handler, event, 3);
                    }
                    catch (error) {
                        console.error(`Handler failed for event ${event.id} on topic ${topic}:`, error);
                        // Send to dead letter topic
                        await this.sendToDeadLetter(topic, event, error);
                    }
                }
            },
        });
    }
    async executeWithRetry(handler, event, maxRetries, attempt = 1) {
        try {
            await handler(event);
        }
        catch (error) {
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.executeWithRetry(handler, event, maxRetries, attempt + 1);
            }
            throw error;
        }
    }
    async sendToDeadLetter(originalTopic, event, error) {
        console.error(`Dead letter: ${originalTopic} event ${event.id}`, {
            error: error.message,
            eventType: event.type,
            tenantId: event.tenantId,
        });
    }
}
exports.EventConsumer = EventConsumer;
//# sourceMappingURL=consumer.js.map