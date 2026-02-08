"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationQuery = buildPaginationQuery;
exports.buildSearchFilter = buildSearchFilter;
exports.buildCursorPagination = buildCursorPagination;
function buildPaginationQuery(query) {
    const offset = (query.page - 1) * query.limit;
    return {
        offset,
        limit: query.limit,
        orderBy: query.sortBy
            ? { [query.sortBy]: query.sortOrder || 'desc' }
            : { createdAt: 'desc' },
    };
}
function buildSearchFilter(search, fields) {
    if (!search) {
        return {};
    }
    return {
        OR: fields.map((field) => ({
            [field]: { contains: search, mode: 'insensitive' },
        })),
    };
}
function buildCursorPagination(cursor, limit = 20) {
    return {
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    };
}
//# sourceMappingURL=pagination.js.map