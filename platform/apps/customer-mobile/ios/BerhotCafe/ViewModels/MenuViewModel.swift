import Foundation
import SwiftUI

@MainActor
class MenuViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var categories: [Category] = []
    @Published var selectedCategory: String? = nil
    @Published var searchText = ""
    @Published var isLoading = true
    @Published var error: String?

    var filteredProducts: [Product] {
        products.filter { product in
            let matchCategory = selectedCategory == nil || product.categoryId == selectedCategory
            let matchSearch = searchText.isEmpty ||
                product.name.localizedCaseInsensitiveContains(searchText) ||
                (product.description?.localizedCaseInsensitiveContains(searchText) ?? false)
            return matchCategory && matchSearch && product.isAvailable
        }
    }

    func loadMenu() async {
        isLoading = true
        error = nil
        do {
            async let productsTask = ProductService.fetchProducts()
            async let categoriesTask = ProductService.fetchCategories()
            let (p, c) = try await (productsTask, categoriesTask)
            self.products = p
            self.categories = c
        } catch {
            self.error = "Unable to load menu. Please check your connection and try again."
        }
        isLoading = false
    }

    func selectCategory(_ id: String?) {
        withAnimation(.easeInOut(duration: 0.2)) {
            selectedCategory = (selectedCategory == id) ? nil : id
        }
    }
}
