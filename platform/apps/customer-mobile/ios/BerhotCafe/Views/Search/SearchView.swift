import SwiftUI

struct SearchView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var cartManager: CartManager

    let products: [Product]
    let categories: [Category]
    let deliveryMode: Int

    @State private var searchText = ""
    @State private var selectedCategory: String? = nil
    @State private var selectedProduct: Product?
    @State private var sortOption: String = "Relevance"
    @FocusState private var isSearchFocused: Bool

    private let brandYellow = Color(hex: "FFD300")

    // MARK: - Filtered results
    private var filteredProducts: [Product] {
        var result = products

        // Filter by category
        if let catId = selectedCategory {
            result = result.filter { $0.categoryId == catId }
        }

        // Filter by search text
        if !searchText.isEmpty {
            let query = searchText.lowercased()
            result = result.filter {
                $0.name.lowercased().contains(query) ||
                ($0.description?.lowercased().contains(query) ?? false)
            }
        }

        return result
    }

    var body: some View {
        VStack(spacing: 0) {
            // ── Top bar: back + search field + clear ──
            HStack(spacing: 12) {
                Button { dismiss() } label: {
                    Image(systemName: "arrow.left")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.black)
                }

                HStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 15))
                        .foregroundColor(Color(hex: "999999"))
                    TextField("Search Berhot Cafe", text: $searchText)
                        .font(.system(size: 16))
                        .focused($isSearchFocused)
                    if !searchText.isEmpty {
                        Button {
                            searchText = ""
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 16))
                                .foregroundColor(Color(hex: "CCCCCC"))
                        }
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(Color(hex: "F5F5F5"))
                .cornerRadius(12)
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 12)

            // ── "Showing results in Delivery/Pickup" ──
            HStack(spacing: 4) {
                Text("Showing results in")
                    .font(.system(size: 13))
                    .foregroundColor(.textSecondary)
                Text(deliveryMode == 0 ? "Delivery" : "Pickup")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(brandYellow)
                Image(systemName: "chevron.down")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(brandYellow)
                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 10)

            // ── Filter chips row ──
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    // Filter icon chip
                    FilterChip(
                        icon: "slider.horizontal.3",
                        label: nil,
                        isActive: false
                    ) { }

                    // Sort By chip
                    FilterChip(
                        icon: "arrow.up.arrow.down",
                        label: "Sort By",
                        isActive: false
                    ) { }

                    // Category chips
                    FilterChip(
                        icon: nil,
                        label: "All",
                        isActive: selectedCategory == nil
                    ) {
                        selectedCategory = nil
                    }

                    ForEach(categories) { cat in
                        FilterChip(
                            icon: nil,
                            label: cat.name,
                            isActive: selectedCategory == cat.id
                        ) {
                            selectedCategory = selectedCategory == cat.id ? nil : cat.id
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
            .padding(.bottom, 12)

            Divider()

            // ── Results ──
            if filteredProducts.isEmpty {
                VStack(spacing: 16) {
                    Spacer()
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 40))
                        .foregroundColor(Color(hex: "DDDDDD"))
                    if searchText.isEmpty {
                        Text("Search for items")
                            .font(.system(size: 16))
                            .foregroundColor(.textSecondary)
                    } else {
                        Text("No results for \"\(searchText)\"")
                            .font(.system(size: 16))
                            .foregroundColor(.textSecondary)
                    }
                    Spacer()
                }
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        // Results count
                        HStack {
                            Text("\(filteredProducts.count) item\(filteredProducts.count == 1 ? "" : "s") found")
                                .font(.system(size: 13))
                                .foregroundColor(.textSecondary)
                            Spacer()
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 12)
                        .padding(.bottom, 8)

                        // Product list
                        ForEach(filteredProducts) { product in
                            SearchProductRow(product: product) {
                                if product.needsModifierSelection {
                                    selectedProduct = product
                                } else {
                                    cartManager.addItem(product: product)
                                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                }
                            } onTap: {
                                selectedProduct = product
                            }
                            .padding(.horizontal, 16)
                            .padding(.bottom, 8)
                        }
                    }
                    .padding(.bottom, 40)
                }
            }
        }
        .background(Color.white)
        .onAppear {
            isSearchFocused = true
        }
        .sheet(item: $selectedProduct) { product in
            ProductDetailView(product: product)
        }
    }
}

// MARK: - Filter Chip
struct FilterChip: View {
    let icon: String?
    let label: String?
    let isActive: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 5) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 13, weight: .medium))
                }
                if let label = label {
                    Text(label)
                        .font(.system(size: 13, weight: .medium))
                }
                if label != nil && icon == "arrow.up.arrow.down" {
                    Image(systemName: "chevron.down")
                        .font(.system(size: 9))
                }
            }
            .foregroundColor(isActive ? .black : Color(hex: "666666"))
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isActive ? Color(hex: "FFD300").opacity(0.2) : Color.white)
            .cornerRadius(20)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(isActive ? Color(hex: "FFD300") : Color(hex: "E0E0E0"), lineWidth: 1)
            )
        }
    }
}

// MARK: - Search Product Row
struct SearchProductRow: View {
    let product: Product
    let onAdd: () -> Void
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Product image
                CachedAsyncImage(url: URL(string: product.imageUrl ?? "")) {
                    RoundedRectangle(cornerRadius: 12).fill(Color(hex: "F5F5F5"))
                        .overlay(Image(systemName: "cup.and.saucer").font(.title3).foregroundColor(.textTertiary))
                }
                .frame(width: 90, height: 90)
                .clipShape(RoundedRectangle(cornerRadius: 12))

                // Details
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.textPrimary)
                        .lineLimit(2)

                    if let desc = product.description, !desc.isEmpty {
                        Text(desc)
                            .font(.system(size: 13))
                            .foregroundColor(.textSecondary)
                            .lineLimit(2)
                    }

                    Spacer()

                    HStack {
                        Text("SAR \(String(format: "%.0f", product.price))")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.textPrimary)
                        Spacer()

                        Button { onAdd() } label: {
                            Image(systemName: "plus")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.black)
                                .frame(width: 30, height: 30)
                                .background(Color(hex: "FFD300"))
                                .clipShape(Circle())
                        }
                    }
                }
            }
            .frame(height: 90)
            .padding(10)
            .background(Color.white)
            .cornerRadius(14)
            .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
        }
        .buttonStyle(.plain)
    }
}
