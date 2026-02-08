"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.now = now;
exports.toUTC = toUTC;
exports.toTimezone = toTimezone;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.fromNow = fromNow;
exports.addDays = addDays;
exports.addHours = addHours;
exports.isExpired = isExpired;
exports.diffInMinutes = diffInMinutes;
exports.diffInHours = diffInHours;
exports.startOfDay = startOfDay;
exports.endOfDay = endOfDay;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const relativeTime_1 = __importDefault(require("dayjs/plugin/relativeTime"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.extend(relativeTime_1.default);
function now() {
    return new Date();
}
function toUTC(date) {
    return (0, dayjs_1.default)(date).utc().toISOString();
}
function toTimezone(date, tz) {
    return (0, dayjs_1.default)(date).tz(tz).format();
}
function formatDate(date, format = 'YYYY-MM-DD') {
    return (0, dayjs_1.default)(date).format(format);
}
function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return (0, dayjs_1.default)(date).format(format);
}
function fromNow(date) {
    return (0, dayjs_1.default)(date).fromNow();
}
function addDays(date, days) {
    return (0, dayjs_1.default)(date).add(days, 'day').toDate();
}
function addHours(date, hours) {
    return (0, dayjs_1.default)(date).add(hours, 'hour').toDate();
}
function isExpired(date) {
    return (0, dayjs_1.default)(date).isBefore((0, dayjs_1.default)());
}
function diffInMinutes(start, end) {
    return (0, dayjs_1.default)(end).diff((0, dayjs_1.default)(start), 'minute');
}
function diffInHours(start, end) {
    return (0, dayjs_1.default)(end).diff((0, dayjs_1.default)(start), 'hour');
}
function startOfDay(date, tz) {
    const d = tz ? (0, dayjs_1.default)(date).tz(tz) : (0, dayjs_1.default)(date);
    return d.startOf('day').toDate();
}
function endOfDay(date, tz) {
    const d = tz ? (0, dayjs_1.default)(date).tz(tz) : (0, dayjs_1.default)(date);
    return d.endOf('day').toDate();
}
//# sourceMappingURL=date.js.map