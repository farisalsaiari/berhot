"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Currencies = void 0;
exports.formatMoney = formatMoney;
exports.toMinorUnits = toMinorUnits;
exports.fromMinorUnits = fromMinorUnits;
exports.Currencies = {
    SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2 },
    AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2 },
    USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
    EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
    GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
    KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', decimals: 3 },
    BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', decimals: 3 },
    QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', decimals: 2 },
    OMR: { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', decimals: 3 },
    EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimals: 2 },
    JOD: { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD', decimals: 3 },
    TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2 },
    INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
    PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimals: 2 },
};
function formatMoney(amount, currencyCode) {
    const currency = exports.Currencies[currencyCode];
    if (!currency) {
        return `${amount.toFixed(2)} ${currencyCode}`;
    }
    return `${currency.symbol} ${amount.toFixed(currency.decimals)}`;
}
function toMinorUnits(amount, currencyCode) {
    const currency = exports.Currencies[currencyCode];
    const decimals = currency?.decimals ?? 2;
    return Math.round(amount * Math.pow(10, decimals));
}
function fromMinorUnits(minorUnits, currencyCode) {
    const currency = exports.Currencies[currencyCode];
    const decimals = currency?.decimals ?? 2;
    return minorUnits / Math.pow(10, decimals);
}
//# sourceMappingURL=currencies.js.map