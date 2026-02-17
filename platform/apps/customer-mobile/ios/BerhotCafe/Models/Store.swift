import Foundation

struct Store: Codable {
    let id: String
    let name: String
    let slug: String?
    let logoUrl: String?
    let heroImageUrl: String?
    let cuisineType: String?
    let ratingAverage: Double
    let ratingCount: Int
    let deliveryTimeMin: Int?
    let deliveryTimeMax: Int?
    let deliveryFee: Double?
    let minimumOrder: Double?
    let isOpen: Bool

    var deliveryTimeText: String {
        if let min = deliveryTimeMin, let max = deliveryTimeMax {
            return "\(min)-\(max) min"
        }
        return "20-30 min"
    }

    var deliveryFeeText: String {
        if let fee = deliveryFee {
            return fee == 0 ? "Free" : "SAR \(String(format: "%.0f", fee))"
        }
        return "SAR 5"
    }

    var ratingText: String {
        if ratingCount == 0 { return "New" }
        return String(format: "%.1f", ratingAverage)
    }
}

struct StoreResponse: Codable {
    let store: Store
}
