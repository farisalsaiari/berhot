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
    @State private var sortOption: SortOption = .relevance
    @State private var selectedDeliveryMode: Int
    @State private var showSortSheet = false
    @State private var showFilterSheet = false
    @State private var showDeliveryMenu = false
    @State private var addedToCartId: String? = nil  // flash feedback
    @FocusState private var isSearchFocused: Bool

    // Filter state
    @State private var filterPriceRange: ClosedRange<Double> = 0...200
    @State private var filterAvailableOnly: Bool = false
    @State private var filterHasImage: Bool = false
    @State private var filterDrinkType: Set<String> = []  // Hot, Iced, etc.
    @State private var filterDietaryOptions: Set<String> = []  // Dairy-Free, Sugar-Free, etc.
    @State private var activeFilterCount: Int = 0

    private let brandYellow = Color(hex: "FFD300")

    init(products: [Product], categories: [Category], deliveryMode: Int) {
        self.products = products
        self.categories = categories
        self.deliveryMode = deliveryMode
        _selectedDeliveryMode = State(initialValue: deliveryMode)
    }

    // MARK: - Sort Options
    enum SortOption: String, CaseIterable {
        case relevance = "Relevance"
        case priceLowToHigh = "Price: Low to High"
        case priceHighToLow = "Price: High to Low"
        case newest = "Newest First"
        case nameAZ = "Name: A → Z"
        case nameZA = "Name: Z → A"

        var icon: String {
            switch self {
            case .relevance: return "sparkles"
            case .priceLowToHigh: return "arrow.up.right"
            case .priceHighToLow: return "arrow.down.right"
            case .newest: return "clock"
            case .nameAZ: return "textformat.abc"
            case .nameZA: return "textformat.abc"
            }
        }
    }

    // MARK: - Filtered & Sorted results
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
                $0.localizedName.lowercased().contains(query) ||
                ($0.nameEn?.lowercased().contains(query) ?? false) ||
                ($0.nameAr?.lowercased().contains(query) ?? false) ||
                ($0.localizedDescription?.lowercased().contains(query) ?? false)
            }
        }

        // Filter by price range
        result = result.filter { $0.price >= filterPriceRange.lowerBound && $0.price <= filterPriceRange.upperBound }

        // Filter available only
        if filterAvailableOnly {
            result = result.filter { $0.isAvailable }
        }

        // Filter has image
        if filterHasImage {
            result = result.filter { $0.imageUrl != nil && !($0.imageUrl?.isEmpty ?? true) }
        }

        // Sort
        switch sortOption {
        case .relevance:
            break // keep original order
        case .priceLowToHigh:
            result.sort { $0.price < $1.price }
        case .priceHighToLow:
            result.sort { $0.price > $1.price }
        case .newest:
            result.sort { ($0.createdAt ?? "") > ($1.createdAt ?? "") }
        case .nameAZ:
            result.sort { $0.localizedName.localizedCaseInsensitiveCompare($1.localizedName) == .orderedAscending }
        case .nameZA:
            result.sort { $0.localizedName.localizedCaseInsensitiveCompare($1.localizedName) == .orderedDescending }
        }

        return result
    }

    /// Count of active filters
    private var computedFilterCount: Int {
        var count = 0
        if filterPriceRange.lowerBound > 0 || filterPriceRange.upperBound < 200 { count += 1 }
        if filterAvailableOnly { count += 1 }
        if filterHasImage { count += 1 }
        if !filterDrinkType.isEmpty { count += filterDrinkType.count }
        if !filterDietaryOptions.isEmpty { count += filterDietaryOptions.count }
        return count
    }

    /// Whether any filter, sort, or category is active
    private var hasActiveFiltersOrSort: Bool {
        sortOption != .relevance || selectedCategory != nil || computedFilterCount > 0
    }

    /// Reset everything back to defaults
    private func resetAll() {
        withAnimation(.easeInOut(duration: 0.2)) {
            sortOption = .relevance
            selectedCategory = nil
            filterPriceRange = 0...200
            filterAvailableOnly = false
            filterHasImage = false
            filterDrinkType = []
            filterDietaryOptions = []
        }
    }

    var body: some View {
        ZStack(alignment: .bottom) {
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
                    TextField(L.searchBerhotCafe, text: $searchText)
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

            // ── "Showing results in Delivery/Pickup" with dropdown ──
            Button {
                showDeliveryMenu.toggle()
            } label: {
                HStack(spacing: 4) {
                    Text(L.showingResultsIn)
                        .font(.system(size: 13))
                        .foregroundColor(.textSecondary)
                    Text(selectedDeliveryMode == 0 ? L.delivery : L.pickup)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(brandYellow)
                    Image(systemName: "chevron.down")
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundColor(brandYellow)
                        .rotationEffect(.degrees(showDeliveryMenu ? 180 : 0))
                    Spacer()
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, showDeliveryMenu ? 0 : 10)

            // Delivery mode dropdown
            if showDeliveryMenu {
                VStack(spacing: 0) {
                    deliveryModeOption(title: L.delivery, icon: "bicycle", index: 0)
                    Divider().padding(.horizontal, 16)
                    deliveryModeOption(title: L.pickup, icon: "bag", index: 1)
                }
                .background(Color(hex: "FAFAFA"))
                .cornerRadius(12)
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 10)
                .transition(.opacity.combined(with: .move(edge: .top)))
                .animation(.easeInOut(duration: 0.2), value: showDeliveryMenu)
            }

            // ── Filter chips row ──
            HStack(spacing: 8) {
                // Reset button — fixed, outside scroll
                if hasActiveFiltersOrSort {
                    Button {
                        resetAll()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                            .frame(width: 30, height: 30)
                            .background(Color(hex: "333333"))
                            .clipShape(Circle())
                    }
                    .transition(.scale.combined(with: .opacity))
                    .padding(.leading, 16)
                }

                // Scrollable chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        // Filter icon chip
                        FilterChip(
                            icon: "slider.horizontal.3",
                            label: computedFilterCount > 0 ? "\(computedFilterCount)" : nil,
                            isActive: computedFilterCount > 0
                        ) {
                            showFilterSheet = true
                        }

                        // Sort By chip
                        FilterChip(
                            icon: "arrow.up.arrow.down",
                            label: sortOption == .relevance ? L.sortBy : sortOption.rawValue,
                            isActive: sortOption != .relevance
                        ) {
                            showSortSheet = true
                        }

                        // Category chips
                        FilterChip(
                            icon: nil,
                            label: L.all,
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
                    .padding(.leading, hasActiveFiltersOrSort ? 0 : 16)
                    .padding(.trailing, 16)
                }
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
                    if searchText.isEmpty && selectedCategory == nil {
                        Text(L.searchForItems)
                            .font(.system(size: 16))
                            .foregroundColor(.textSecondary)
                    } else {
                        Text(L.noResultsFound)
                            .font(.system(size: 16))
                            .foregroundColor(.textSecondary)
                        Text(L.tryAdjustingFilters)
                            .font(.system(size: 13))
                            .foregroundColor(.textTertiary)
                    }
                    Spacer()
                }
                .padding(.bottom, cartManager.isEmpty ? 0 : 70)
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        // Results count + sort indicator
                        HStack {
                            Text(L.itemsFound(filteredProducts.count))
                                .font(.system(size: 13))
                                .foregroundColor(.textSecondary)
                            Spacer()
                            if sortOption != .relevance {
                                Text(sortOption.rawValue)
                                    .font(.system(size: 12))
                                    .foregroundColor(.textTertiary)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 12)
                        .padding(.bottom, 8)

                        // Product list
                        ForEach(filteredProducts) { product in
                            SearchProductRow(
                                product: product,
                                addedToCart: addedToCartId == product.id
                            ) {
                                // + button: auto-add if no modifiers needed
                                if product.needsModifierSelection {
                                    selectedProduct = product
                                } else {
                                    cartManager.addItem(product: product)
                                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                    // Flash feedback
                                    withAnimation(.easeInOut(duration: 0.15)) {
                                        addedToCartId = product.id
                                    }
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                                        withAnimation(.easeInOut(duration: 0.15)) {
                                            addedToCartId = nil
                                        }
                                    }
                                }
                            } onTap: {
                                selectedProduct = product
                            }
                            .padding(.horizontal, 16)
                            .padding(.bottom, 8)
                        }
                    }
                    .padding(.bottom, cartManager.isEmpty ? 40 : 100)
                }
            }
        }

            // Floating Cart Button
            if !cartManager.isEmpty {
                floatingCartButton
            }
        } // ZStack
        .background(Color.white)
        .onAppear {
            isSearchFocused = true
        }
        .sheet(item: $selectedProduct) { product in
            ProductDetailView(product: product)
        }
        .sheet(isPresented: $showSortSheet) {
            SortBySheet(selected: $sortOption)
                .presentationDetents([.height(380)])
                .presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $showFilterSheet) {
            SearchFilterView(
                priceRange: $filterPriceRange,
                availableOnly: $filterAvailableOnly,
                hasImage: $filterHasImage,
                drinkType: $filterDrinkType,
                dietaryOptions: $filterDietaryOptions,
                categories: categories,
                selectedCategory: $selectedCategory
            )
            .presentationDetents([.large])
            .presentationDragIndicator(.visible)
        }
    }

    // MARK: - Floating Cart Button
    private var floatingCartButton: some View {
        Button {
            dismiss()
        } label: {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "cart.fill").font(.system(size: 16))
                    Text("\(cartManager.itemCount) \(L.items)")
                        .font(.system(size: 14, weight: .semibold))
                }
                Spacer()
                Text(cartManager.total.formattedCurrency)
                    .font(.system(size: 15, weight: .bold))
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .background(brandYellow)
            .foregroundColor(.black)
            .cornerRadius(16)
            .shadow(color: brandYellow.opacity(0.4), radius: 12, y: 6)
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 8)
    }

    // MARK: - Delivery Mode Option Row
    private func deliveryModeOption(title: String, icon: String, index: Int) -> some View {
        Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                selectedDeliveryMode = index
                showDeliveryMenu = false
            }
        } label: {
            HStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundColor(selectedDeliveryMode == index ? brandYellow : Color(hex: "666666"))
                    .frame(width: 20)
                Text(title)
                    .font(.system(size: 14, weight: selectedDeliveryMode == index ? .semibold : .regular))
                    .foregroundColor(selectedDeliveryMode == index ? .black : Color(hex: "666666"))
                Spacer()
                if selectedDeliveryMode == index {
                    Image(systemName: "checkmark")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(brandYellow)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
    }
}

// MARK: - Sort By Sheet
struct SortBySheet: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var selected: SearchView.SortOption

    private let brandYellow = Color(hex: "FFD300")

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text(L.sortBy)
                    .font(.system(size: 18, weight: .bold))
                Spacer()
                Button { dismiss() } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(Color(hex: "DDDDDD"))
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
            .padding(.bottom, 16)

            Divider()

            // Options
            ForEach(SearchView.SortOption.allCases, id: \.self) { option in
                Button {
                    selected = option
                    dismiss()
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: option.icon)
                            .font(.system(size: 15))
                            .foregroundColor(selected == option ? brandYellow : Color(hex: "666666"))
                            .frame(width: 24)
                        Text(option.rawValue)
                            .font(.system(size: 15, weight: selected == option ? .semibold : .regular))
                            .foregroundColor(selected == option ? .black : Color(hex: "333333"))
                        Spacer()
                        if selected == option {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 18))
                                .foregroundColor(brandYellow)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 14)
                }
                if option != SearchView.SortOption.allCases.last {
                    Divider().padding(.leading, 56)
                }
            }

            Spacer()
        }
        .background(Color.white)
    }
}

// MARK: - Search Filter View
struct SearchFilterView: View {
    @Environment(\.dismiss) private var dismiss

    @Binding var priceRange: ClosedRange<Double>
    @Binding var availableOnly: Bool
    @Binding var hasImage: Bool
    @Binding var drinkType: Set<String>
    @Binding var dietaryOptions: Set<String>
    @Binding var categories: [Category]
    @Binding var selectedCategory: String?

    // Local state for editing
    @State private var localMinPrice: Double = 0
    @State private var localMaxPrice: Double = 200
    @State private var localAvailableOnly: Bool = false
    @State private var localHasImage: Bool = false
    @State private var localDrinkType: Set<String> = []
    @State private var localDietaryOptions: Set<String> = []
    @State private var localSelectedCategory: String? = nil

    private let brandYellow = Color(hex: "FFD300")

    private let drinkTypes = ["Hot", "Iced", "Blended", "Specialty"]
    private let dietaryList = ["Dairy-Free", "Sugar-Free", "Decaf", "Vegan", "Gluten-Free", "Nut-Free"]

    init(priceRange: Binding<ClosedRange<Double>>,
         availableOnly: Binding<Bool>,
         hasImage: Binding<Bool>,
         drinkType: Binding<Set<String>>,
         dietaryOptions: Binding<Set<String>>,
         categories: [Category],
         selectedCategory: Binding<String?>) {
        _priceRange = priceRange
        _availableOnly = availableOnly
        _hasImage = hasImage
        _drinkType = drinkType
        _dietaryOptions = dietaryOptions
        _categories = .constant(categories)
        _selectedCategory = selectedCategory
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {

                    // ── Category ──
                    filterSection(title: L.category) {
                        FlowLayout(spacing: 8) {
                            FilterToggleChip(label: L.all, isSelected: localSelectedCategory == nil) {
                                localSelectedCategory = nil
                            }
                            ForEach(categories) { cat in
                                FilterToggleChip(label: cat.name, isSelected: localSelectedCategory == cat.id) {
                                    localSelectedCategory = localSelectedCategory == cat.id ? nil : cat.id
                                }
                            }
                        }
                    }

                    Divider()

                    // ── Price Range ──
                    filterSection(title: L.priceRangeSAR) {
                        VStack(spacing: 12) {
                            HStack {
                                Text("SAR \(Int(localMinPrice))")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.textPrimary)
                                Spacer()
                                Text("SAR \(Int(localMaxPrice))")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.textPrimary)
                            }
                            HStack(spacing: 12) {
                                Slider(value: $localMinPrice, in: 0...200, step: 5)
                                    .tint(brandYellow)
                                Slider(value: $localMaxPrice, in: 0...200, step: 5)
                                    .tint(brandYellow)
                            }
                        }
                    }

                    Divider()

                    // ── Drink Type ──
                    filterSection(title: L.drinkType) {
                        FlowLayout(spacing: 8) {
                            ForEach(drinkTypes, id: \.self) { type in
                                FilterToggleChip(
                                    label: type,
                                    isSelected: localDrinkType.contains(type)
                                ) {
                                    if localDrinkType.contains(type) {
                                        localDrinkType.remove(type)
                                    } else {
                                        localDrinkType.insert(type)
                                    }
                                }
                            }
                        }
                    }

                    Divider()

                    // ── Dietary Preferences ──
                    filterSection(title: L.dietaryPreferences) {
                        FlowLayout(spacing: 8) {
                            ForEach(dietaryList, id: \.self) { option in
                                FilterToggleChip(
                                    label: option,
                                    isSelected: localDietaryOptions.contains(option)
                                ) {
                                    if localDietaryOptions.contains(option) {
                                        localDietaryOptions.remove(option)
                                    } else {
                                        localDietaryOptions.insert(option)
                                    }
                                }
                            }
                        }
                    }

                    Divider()

                    // ── Other Options ──
                    filterSection(title: L.other) {
                        VStack(spacing: 0) {
                            filterToggleRow(title: L.availableItemsOnly, icon: "checkmark.circle", isOn: $localAvailableOnly)
                            Divider().padding(.leading, 40)
                            filterToggleRow(title: L.withPhotosOnly, icon: "photo", isOn: $localHasImage)
                        }
                        .background(Color(hex: "FAFAFA"))
                        .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 100)
            }
            .navigationTitle(L.filters)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(L.reset) {
                        resetFilters()
                    }
                    .font(.system(size: 15))
                    .foregroundColor(Color(hex: "999999"))
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 22))
                            .foregroundColor(Color(hex: "DDDDDD"))
                    }
                }
            }
            .safeAreaInset(edge: .bottom) {
                Button {
                    applyFilters()
                    dismiss()
                } label: {
                    Text(L.applyFilters)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(brandYellow)
                        .cornerRadius(14)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(
                    Color.white
                        .shadow(color: .black.opacity(0.08), radius: 8, y: -4)
                        .edgesIgnoringSafeArea(.bottom)
                )
            }
        }
        .onAppear {
            // Initialize local state from bindings
            localMinPrice = priceRange.lowerBound
            localMaxPrice = priceRange.upperBound
            localAvailableOnly = availableOnly
            localHasImage = hasImage
            localDrinkType = drinkType
            localDietaryOptions = dietaryOptions
            localSelectedCategory = selectedCategory
        }
    }

    private func filterSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.textPrimary)
            content()
        }
    }

    private func filterToggleRow(title: String, icon: String, isOn: Binding<Bool>) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(Color(hex: "666666"))
                .frame(width: 24)
            Text(title)
                .font(.system(size: 14))
                .foregroundColor(.textPrimary)
            Spacer()
            Toggle("", isOn: isOn)
                .tint(brandYellow)
                .labelsHidden()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
    }

    private func applyFilters() {
        let minP = min(localMinPrice, localMaxPrice)
        let maxP = max(localMinPrice, localMaxPrice)
        priceRange = minP...maxP
        availableOnly = localAvailableOnly
        hasImage = localHasImage
        drinkType = localDrinkType
        dietaryOptions = localDietaryOptions
        selectedCategory = localSelectedCategory
    }

    private func resetFilters() {
        localMinPrice = 0
        localMaxPrice = 200
        localAvailableOnly = false
        localHasImage = false
        localDrinkType = []
        localDietaryOptions = []
        localSelectedCategory = nil
    }
}

// MARK: - Filter Toggle Chip (for filter view)
struct FilterToggleChip: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    private let brandYellow = Color(hex: "FFD300")

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 13, weight: isSelected ? .semibold : .regular))
                .foregroundColor(isSelected ? .black : Color(hex: "666666"))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(isSelected ? brandYellow.opacity(0.2) : Color(hex: "F5F5F5"))
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(isSelected ? brandYellow : Color.clear, lineWidth: 1)
                )
        }
    }
}

// MARK: - Flow Layout (wrapping horizontal chips)
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrangeSubviews(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrangeSubviews(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                                  proposal: .unspecified)
        }
    }

    private func arrangeSubviews(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0
        var maxX: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > maxWidth && currentX > 0 {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            positions.append(CGPoint(x: currentX, y: currentY))
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
            maxX = max(maxX, currentX - spacing)
        }

        return (positions, CGSize(width: maxX, height: currentY + lineHeight))
    }
}

// MARK: - Filter Chip
struct FilterChip: View {
    let icon: String?
    let label: String?
    let isActive: Bool
    let action: () -> Void

    private let brandYellow = Color(hex: "FFD300")

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
            .background(isActive ? brandYellow.opacity(0.2) : Color.white)
            .cornerRadius(20)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(isActive ? brandYellow : Color(hex: "E0E0E0"), lineWidth: 1)
            )
        }
    }
}

// MARK: - Search Product Row
struct SearchProductRow: View {
    let product: Product
    var addedToCart: Bool = false
    let onAdd: () -> Void
    let onTap: () -> Void

    private let brandYellow = Color(hex: "FFD300")

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Details
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.localizedName)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.textPrimary)
                        .lineLimit(2)

                    if let desc = product.localizedDescription, !desc.isEmpty {
                        Text(desc)
                            .font(.system(size: 13))
                            .foregroundColor(.textSecondary)
                            .lineLimit(2)
                    }

                    Spacer()

                    Text("SAR \(String(format: "%.0f", product.price))")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.textPrimary)
                }

                Spacer()

                // Product image + add button
                ZStack(alignment: .bottomTrailing) {
                    CachedAsyncImage(url: product.resolvedImageUrl) {
                        RoundedRectangle(cornerRadius: 12).fill(Color(hex: "F5F5F5"))
                            .overlay(Image(systemName: "cup.and.saucer").font(.title3).foregroundColor(.textTertiary))
                    }
                    .frame(width: 90, height: 90)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    Button { onAdd() } label: {
                        Image(systemName: addedToCart ? "checkmark" : "plus")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.black)
                            .frame(width: 30, height: 30)
                            .background(addedToCart ? Color(hex: "4CAF50") : brandYellow)
                            .clipShape(Circle())
                            .shadow(color: .black.opacity(0.15), radius: 3, y: 1)
                    }
                    .offset(x: 6, y: 6)
                }
            }
            .frame(minHeight: 90)
            .padding(10)
            .background(Color.white)
            .cornerRadius(14)
            .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
        }
        .buttonStyle(.plain)
    }
}
