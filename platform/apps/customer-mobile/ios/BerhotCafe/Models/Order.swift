import Foundation

struct Order: Codable, Identifiable {
    let id: String
    let tenantId: String?
    let customerId: String?
    let customerName: String?
    let customerEmail: String?
    let customerPhone: String?
    let orderNumber: String
    let orderType: String
    let status: String
    let subtotal: Double
    let taxAmount: Double
    let discountAmount: Double
    let totalAmount: Double
    let notes: String?
    let items: [OrderItem]?
    let createdAt: String
    let updatedAt: String?

    var statusColor: String {
        switch status.lowercased() {
        case "pending": return "orange"
        case "preparing": return "blue"
        case "ready": return "purple"
        case "completed": return "green"
        case "cancelled": return "red"
        default: return "gray"
        }
    }

    var formattedDate: String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: createdAt) {
            let display = DateFormatter()
            display.dateStyle = .medium
            display.timeStyle = .short
            return display.string(from: date)
        }
        return createdAt
    }
}

struct OrderItem: Codable, Identifiable {
    let id: String?
    let productId: String
    let productName: String
    let quantity: Int
    let unitPrice: Double
    let totalPrice: Double
    let notes: String?
}

struct OrdersResponse: Codable {
    let orders: [Order]
}

struct CreateOrderRequest: Codable {
    let customerId: String?
    let orderType: String
    let items: [CreateOrderItem]
    let notes: String?
}

struct CreateOrderItem: Codable {
    let productId: String
    let quantity: Int
    let notes: String?
}
