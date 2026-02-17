import Foundation

enum StoreService {
    static func fetchStoreInfo() async throws -> Store {
        let response: StoreResponse = try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/store")
        return response.store
    }
}
