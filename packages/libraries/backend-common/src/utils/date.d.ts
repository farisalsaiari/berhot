export declare function now(): Date;
export declare function toUTC(date: Date | string): string;
export declare function toTimezone(date: Date | string, tz: string): string;
export declare function formatDate(date: Date | string, format?: string): string;
export declare function formatDateTime(date: Date | string, format?: string): string;
export declare function fromNow(date: Date | string): string;
export declare function addDays(date: Date | string, days: number): Date;
export declare function addHours(date: Date | string, hours: number): Date;
export declare function isExpired(date: Date | string): boolean;
export declare function diffInMinutes(start: Date | string, end: Date | string): number;
export declare function diffInHours(start: Date | string, end: Date | string): number;
export declare function startOfDay(date: Date | string, tz?: string): Date;
export declare function endOfDay(date: Date | string, tz?: string): Date;
//# sourceMappingURL=date.d.ts.map