import Foundation

enum OrderService {
    static func createOrder(request: CreateOrderRequest) async throws -> Order {
        return try await APIClient.shared.posRequest("POST", path: "/api/v1/pos/orders", body: request)
    }

    static func fetchOrders() async throws -> [Order] {
        let response: OrdersResponse = try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/orders")
        return response.orders
    }

    static func fetchOrder(id: String) async throws -> Order {
        return try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/orders/\(id)")
    }
}
