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
    let discountAmount: Double?
    let totalAmount: Double?
    let total: Double?
    let notes: String?
    let items: [OrderItem]?
    let createdAt: String?
    let updatedAt: String?
    let currency: String?

    /// Resolves totalAmount from either `totalAmount` or `total` field
    var resolvedTotal: Double {
        totalAmount ?? total ?? 0
    }

    var statusColor: String {
        switch status.lowercased() {
        case "pending": return "orange"
        case "accepted": return "cyan"
        case "preparing": return "blue"
        case "ready": return "purple"
        case "completed": return "green"
        case "cancelled": return "red"
        default: return "gray"
        }
    }

    var isCompleted: Bool {
        status.lowercased() == "completed"
    }

    var isActive: Bool {
        let s = status.lowercased()
        return s == "pending" || s == "accepted" || s == "preparing" || s == "ready"
    }

    var formattedDate: String {
        guard let createdAt = createdAt else { return "" }
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
    let productName: String?
    let name: String?
    let quantity: Int
    let unitPrice: Double
    let totalPrice: Double
    let taxAmount: Double?
    let notes: String?
    let modifiers: [OrderItemModifier]?

    /// Resolves display name from either `productName` or `name` field
    var displayName: String {
        productName ?? name ?? "Item"
    }
}

struct OrderItemModifier: Codable {
    let name: String?
    let priceAdjustment: Double?
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
    let modifiers: [CreateOrderModifier]?
}

struct CreateOrderModifier: Codable {
    let modifierItemId: String
    let name: String
    let priceAdjustment: Double
}
