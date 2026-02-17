import Foundation

@MainActor
class OrderDetailViewModel: ObservableObject {
    @Published var order: Order?
    @Published var isLoading = true
    @Published var error: String?

    private var pollingTask: Task<Void, Never>?
    private let orderId: String

    init(orderId: String) {
        self.orderId = orderId
    }

    func loadOrder() async {
        isLoading = true
        error = nil
        do {
            self.order = try await OrderService.fetchOrder(id: orderId)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func startPolling() {
        stopPolling()
        pollingTask = Task {
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: UInt64(AppConfig.orderPollingInterval * 1_000_000_000))
                guard !Task.isCancelled else { break }
                do {
                    let updated = try await OrderService.fetchOrder(id: orderId)
                    self.order = updated
                    // Stop polling if order is in final state
                    if ["completed", "cancelled"].contains(updated.status.lowercased()) {
                        break
                    }
                } catch {
                    // Continue polling on error
                }
            }
        }
    }

    func stopPolling() {
        pollingTask?.cancel()
        pollingTask = nil
    }
}
