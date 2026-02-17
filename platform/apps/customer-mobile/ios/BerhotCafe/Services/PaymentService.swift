import Foundation

enum PaymentService {
    static func processPayment(request: PaymentRequest) async throws -> Payment {
        return try await APIClient.shared.posRequest("POST", path: "/api/v1/pos/payments", body: request)
    }

    static func fetchPayments(orderId: String) async throws -> [Payment] {
        let response: PaymentsResponse = try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/payments/\(orderId)")
        return response.payments
    }
}
