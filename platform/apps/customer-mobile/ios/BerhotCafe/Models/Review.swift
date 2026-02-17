import Foundation

struct Review: Codable, Identifiable {
    let id: String
    let orderId: String?
    let customerId: String?
    let customerName: String?
    let rating: Int
    let comment: String?
    let merchantReply: String?
    let merchantRepliedAt: String?
    let createdAt: String

    var formattedDate: String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: createdAt) {
            let display = DateFormatter()
            display.dateStyle = .medium
            display.timeStyle = .none
            return display.string(from: date)
        }
        return createdAt
    }
}

struct ReviewsResponse: Codable {
    let reviews: [Review]
    let total: Int?
}

struct ReviewStatsResponse: Codable {
    let averageRating: Double
    let totalCount: Int
    let distribution: [Int]?
}

// MARK: - Item Rating

struct ItemRating: Codable, Identifiable {
    let id: String?
    let productId: String
    let productName: String
    let rating: Int
    let comment: String?
}

struct ItemRatingsResponse: Codable {
    let itemRatings: [ItemRating]
}

// MARK: - Create Review Request (with item ratings)

struct CreateReviewRequest: Codable {
    let orderId: String
    let customerId: String
    let rating: Int
    let comment: String?
    let itemRatings: [CreateItemRating]?
}

struct CreateItemRating: Codable {
    let productId: String
    let productName: String
    let rating: Int
    let comment: String?
}
