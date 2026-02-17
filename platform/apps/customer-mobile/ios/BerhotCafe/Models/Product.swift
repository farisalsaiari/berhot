import Foundation

struct Product: Codable, Identifiable {
    let id: String
    let tenantId: String?
    let categoryId: String?
    let name: String
    let sku: String?
    let description: String?
    let price: Double
    let cost: Double?
    let imageUrl: String?
    let isAvailable: Bool
    let sortOrder: Int?
    let createdAt: String?
    let updatedAt: String?
    let category: Category?
}

struct ProductsResponse: Codable {
    let products: [Product]
}
