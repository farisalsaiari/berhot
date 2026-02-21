import SwiftUI

struct MenuView: View {
    @StateObject private var viewModel = MenuViewModel()
    @EnvironmentObject var cartManager: CartManager
    @State private var selectedProduct: Product?

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Search bar
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.textTertiary)
                    TextField(L.searchMenu, text: $viewModel.searchText)
                        .font(.body)
                }
                .padding(12)
                .background(Color.surfaceSecondary)
                .cornerRadius(12)
                .padding(.horizontal)
                .padding(.top, 8)

                // Category tabs
                if !viewModel.categories.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            CategoryChip(
                                name: L.all,
                                isSelected: viewModel.selectedCategory == nil
                            ) {
                                viewModel.selectCategory(nil)
                            }

                            ForEach(viewModel.categories) { category in
                                CategoryChip(
                                    name: category.localizedName,
                                    isSelected: viewModel.selectedCategory == category.id
                                ) {
                                    viewModel.selectCategory(category.id)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    .padding(.top, 16)
                }

                // Products grid
                if viewModel.isLoading {
                    LoadingView(message: L.loadingMenu)
                        .padding(.top, 60)
                } else if let error = viewModel.error {
                    ErrorView(message: error) {
                        Task { await viewModel.loadMenu() }
                    }
                    .padding(.top, 60)
                } else if viewModel.filteredProducts.isEmpty {
                    EmptyStateView(
                        icon: "menucard",
                        title: L.noItemsFound,
                        message: viewModel.searchText.isEmpty ? L.menuItemsAppear : L.tryDifferentSearch
                    )
                    .padding(.top, 60)
                } else {
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 12),
                        GridItem(.flexible(), spacing: 12),
                    ], spacing: 12) {
                        ForEach(viewModel.filteredProducts) { product in
                            ProductCardView(product: product) {
                                selectedProduct = product
                            }
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle(L.menu)
        .refreshable {
            await viewModel.loadMenu()
        }
        .task {
            await viewModel.loadMenu()
        }
        .sheet(item: $selectedProduct) { product in
            ProductDetailView(product: product)
        }
    }
}

struct CategoryChip: View {
    let name: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(name)
                .font(.subheadline.weight(.medium))
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.brand : Color.surfaceSecondary)
                .foregroundColor(isSelected ? .white : .textSecondary)
                .cornerRadius(20)
        }
    }
}
