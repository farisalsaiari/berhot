import Foundation

struct Category: Codable, Identifiable {
    let id: String
    let tenantId: String?
    let name: String
    let description: String?
    let sortOrder: Int?
    let createdAt: String?
    let updatedAt: String?
}

struct CategoriesResponse: Codable {
    let categories: [Category]
}
