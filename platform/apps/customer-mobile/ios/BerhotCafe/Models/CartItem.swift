import Foundation

struct CartItem: Codable, Identifiable {
    /// Unique ID = productId + sorted modifier key for uniqueness
    var id: String {
        let modKey = modifiers.sorted { $0.itemId < $1.itemId }.map(\.itemId).joined(separator: "-")
        return modKey.isEmpty ? productId : "\(productId)_\(modKey)"
    }

    let productId: String
    let productName: String
    let price: Double
    var quantity: Int
    var notes: String?
    let imageUrl: String?
    var modifiers: [SelectedModifier]

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
}
