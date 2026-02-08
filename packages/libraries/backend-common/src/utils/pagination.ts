import { type PaginationQuery } from '../types/pagination';

export function buildPaginationQuery(query: PaginationQuery) {
  const offset = (query.page - 1) * query.limit;
  return {
    offset,
    limit: query.limit,
    orderBy: query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' as const },
  };
}

export function buildSearchFilter(search: string | undefined, fields: string[]) {
  if (!search) {
    return {};
  }
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' as const },
    })),
  };
}

export function buildCursorPagination(cursor?: string, limit = 20) {
  return {
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  };
}
