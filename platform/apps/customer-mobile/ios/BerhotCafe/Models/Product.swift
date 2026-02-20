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

    /// Resolves relative image paths (e.g. "/uploads/xxx.png") to full URLs using POS base
    var resolvedImageUrl: URL? {
        guard let raw = imageUrl, !raw.isEmpty else { return nil }
        if raw.hasPrefix("http") {
            return URL(string: raw)
        }
        // Relative path — prepend POS base URL
        return URL(string: AppConfig.posBaseURL + raw)
    }
}

struct ProductsResponse: Codable {
    let products: [Product]
    let total: Int?
}
