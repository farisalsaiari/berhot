import Foundation

@MainActor
class OrderHistoryViewModel: ObservableObject {
    @Published var orders: [Order] = []
    @Published var isLoading = true
    @Published var error: String?

    func loadOrders() async {
        isLoading = true
        error = nil
        do {
            let result = try await OrderService.fetchOrders()
            self.orders = result.sorted { ($0.createdAt ?? "") > ($1.createdAt ?? "") }
        } catch {
            self.error = "Unable to load orders. Please check your connection and try again."
        }
        isLoading = false
    }
}
