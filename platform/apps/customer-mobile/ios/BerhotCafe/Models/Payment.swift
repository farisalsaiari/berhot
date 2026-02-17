import Foundation

struct Payment: Codable, Identifiable {
    let id: String
    let orderId: String
    let amount: Double
    let paymentMethod: String
    let status: String
    let reference: String?
    let createdAt: String
}

struct PaymentRequest: Codable {
    let orderId: String
    let amount: Double
    let paymentMethod: String
    let reference: String?
}

struct PaymentsResponse: Codable {
    let payments: [Payment]
}
