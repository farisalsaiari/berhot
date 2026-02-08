import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export function now(): Date {
  return new Date();
}

export function toUTC(date: Date | string): string {
  return dayjs(date).utc().toISOString();
}

export function toTimezone(date: Date | string, tz: string): string {
  return dayjs(date).tz(tz).format();
}

export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: Date | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(format);
}

export function fromNow(date: Date | string): string {
  return dayjs(date).fromNow();
}

export function addDays(date: Date | string, days: number): Date {
  return dayjs(date).add(days, 'day').toDate();
}

export function addHours(date: Date | string, hours: number): Date {
  return dayjs(date).add(hours, 'hour').toDate();
}

export function isExpired(date: Date | string): boolean {
  return dayjs(date).isBefore(dayjs());
}

export function diffInMinutes(start: Date | string, end: Date | string): number {
  return dayjs(end).diff(dayjs(start), 'minute');
}

export function diffInHours(start: Date | string, end: Date | string): number {
  return dayjs(end).diff(dayjs(start), 'hour');
}

export function startOfDay(date: Date | string, tz?: string): Date {
  const d = tz ? dayjs(date).tz(tz) : dayjs(date);
  return d.startOf('day').toDate();
}

export function endOfDay(date: Date | string, tz?: string): Date {
  const d = tz ? dayjs(date).tz(tz) : dayjs(date);
  return d.endOf('day').toDate();
}
