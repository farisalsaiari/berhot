import Foundation

struct Product: Codable, Identifiable {
    let id: String
    let tenantId: String?
    let categoryId: String?
    let categoryName: String?
    let name: String
    let sku: String?
    let description: String?
    let price: Double
    let cost: Double?
    let imageUrl: String?
    let isActive: Bool?
    let sortOrder: Int?
    let hasRequiredModifiers: Bool?
    let createdAt: String?
    let updatedAt: String?
    let category: Category?

    var isAvailable: Bool { isActive ?? true }

    var needsModifierSelection: Bool {
        hasRequiredModifiers ?? false
    }
}

struct ProductsResponse: Codable {
    let products: [Product]
    let total: Int?
}
