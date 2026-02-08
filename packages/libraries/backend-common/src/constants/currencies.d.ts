export interface Currency {
    code: string;
    name: string;
    symbol: string;
    decimals: number;
}
export declare const Currencies: Record<string, Currency>;
export declare function formatMoney(amount: number, currencyCode: string): string;
export declare function toMinorUnits(amount: number, currencyCode: string): number;
export declare function fromMinorUnits(minorUnits: number, currencyCode: string): number;
//# sourceMappingURL=currencies.d.ts.map