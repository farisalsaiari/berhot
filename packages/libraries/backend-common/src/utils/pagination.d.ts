import { type PaginationQuery } from '../types/pagination';
export declare function buildPaginationQuery(query: PaginationQuery): {
    offset: number;
    limit: number;
    orderBy: {
        [query.sortBy]: "asc" | "desc";
        createdAt?: undefined;
    } | {
        createdAt: "desc";
    };
};
export declare function buildSearchFilter(search: string | undefined, fields: string[]): {
    OR?: undefined;
} | {
    OR: {
        [x: string]: {
            contains: string;
            mode: "insensitive";
        };
    }[];
};
export declare function buildCursorPagination(cursor?: string, limit?: number): {
    cursor?: {
        id: string;
    } | undefined;
    skip?: number | undefined;
    take: number;
};
//# sourceMappingURL=pagination.d.ts.map