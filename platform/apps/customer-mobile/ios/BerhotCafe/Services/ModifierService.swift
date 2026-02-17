import Foundation

enum ModifierService {
    static func fetchProductModifiers(productId: String) async throws -> [ModifierGroup] {
        let response: ProductModifiersResponse = try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/products/\(productId)/modifiers")
        return response.modifierGroups
    }

    static func fetchAllModifierGroups() async throws -> [ModifierGroup] {
        let response: ModifierGroupsResponse = try await APIClient.shared.posRequest("GET", path: "/api/v1/pos/modifier-groups")
        return response.modifierGroups
    }
}
