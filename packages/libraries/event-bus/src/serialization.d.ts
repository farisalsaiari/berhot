import { type DomainEvent } from './types';
export declare function serializeEvent<T>(event: DomainEvent<T>): Buffer;
export declare function deserializeEvent<T = unknown>(buffer: Buffer): DomainEvent<T>;
//# sourceMappingURL=serialization.d.ts.map