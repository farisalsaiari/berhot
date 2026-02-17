import Foundation

extension Double {
    var formattedCurrency: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "SAR"
        formatter.currencySymbol = "SAR "
        formatter.maximumFractionDigits = 2
        formatter.minimumFractionDigits = 2
        return formatter.string(from: NSNumber(value: self)) ?? "SAR \(String(format: "%.2f", self))"
    }

    var formattedPrice: String {
        String(format: "%.2f", self)
    }
}
