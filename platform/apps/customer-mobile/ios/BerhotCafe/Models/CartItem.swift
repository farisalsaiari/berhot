import Foundation

struct CartItem: Codable, Identifiable {
    /// Unique ID = productId + sorted modifier key for uniqueness
    var id: String {
        let modKey = modifiers.sorted { $0.itemId < $1.itemId }.map(\.itemId).joined(separator: "-")
        return modKey.isEmpty ? productId : "\(productId)_\(modKey)"
    }

    let productId: String
    let productName: String
    let productNameEn: String?
    let productNameAr: String?
    let price: Double
    var quantity: Int
    var notes: String?
    let imageUrl: String?
    var modifiers: [SelectedModifier]

    /// Returns the localized product name for display.
    var localizedProductName: String {
        if LanguageManager.shared.currentLanguage == .arabic {
            return (productNameAr?.isEmpty == false) ? productNameAr! : productName
        }
        return (productNameEn?.isEmpty == false) ? productNameEn! : productName
    }

    var modifiersTotal: Double {
        modifiers.reduce(0) { $0 + $1.priceAdjustment }
    }

    var unitTotal: Double {
        price + modifiersTotal
    }

    var totalPrice: Double {
        unitTotal * Double(quantity)
    }

    var modifiersSummary: String? {
        let names = modifiers.map(\.itemName)
        return names.isEmpty ? nil : names.joined(separator: ", ")
    }

    /// Resolves relative image paths to full URLs using POS base
    var resolvedImageUrl: URL? {
        guard let raw = imageUrl, !raw.isEmpty else { return nil }
        if raw.hasPrefix("http") {
            return URL(string: raw)
        }
        return URL(string: AppConfig.posBaseURL + raw)
    }
}
