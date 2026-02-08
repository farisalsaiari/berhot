"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeEvent = serializeEvent;
exports.deserializeEvent = deserializeEvent;
function serializeEvent(event) {
    return Buffer.from(JSON.stringify(event), 'utf-8');
}
function deserializeEvent(buffer) {
    const str = buffer.toString('utf-8');
    return JSON.parse(str);
}
//# sourceMappingURL=serialization.js.map