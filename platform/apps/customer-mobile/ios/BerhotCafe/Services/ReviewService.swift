import Foundation

enum ReviewService {
    static func createReview(request: CreateReviewRequest) async throws -> Review {
        return try await APIClient.shared.posRequest("POST", path: "/api/v1/pos/reviews", body: request)
    }

    static func fetchReviews() async throws -> [Review] {
        let response: ReviewsResponse = try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/reviews")
        return response.reviews
    }

    static func fetchReviewStats() async throws -> ReviewStatsResponse {
        return try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/reviews/stats")
    }

    static func fetchItemRatings(reviewId: String) async throws -> [ItemRating] {
        let response: ItemRatingsResponse = try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/reviews/\(reviewId)/item-ratings")
        return response.itemRatings
    }
}
