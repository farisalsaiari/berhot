import Foundation

enum ProductService {
    static func fetchProducts() async throws -> [Product] {
        let response: ProductsResponse = try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/products")
        return response.products
    }

    static func fetchCategories() async throws -> [Category] {
        let response: CategoriesResponse = try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/categories")
        return response.categories
    }

    static func fetchProduct(id: String) async throws -> Product {
        return try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/products/\(id)")
    }
}
