import SwiftUI
import MapKit

struct HomeView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var cartManager: CartManager
    @EnvironmentObject var tabBarVisibility: TabBarVisibility
    @ObservedObject private var locationManager = LocationManager.shared
    @State private var store: Store?
    @State private var products: [Product] = []
    @State private var categories: [Category] = []
    @State private var selectedCategory: String? = nil
    @State private var isLoading = true
    @State private var showProfile = false
    @State private var selectedProduct: Product?
    @State private var deliveryMode = 0 // 0 = Delivery, 1 = Pickup
    @State private var searchText = ""
    @State private var showSearch = false
    @State private var showLocationPicker = false
    @State private var showSearchView = false
    @State private var bannerSettings: BannerSettings?
    @State private var banners: [HomeBanner] = []
    @State private var currentBannerIndex = 0
    @State private var bannerTimer: Timer?
    @State private var isTapScrolling = false   // true while programmatic scroll-to is in flight
    @State private var categoryPositions: [String: CGFloat] = [:]  // catId → minY in global coords
    @State private var lastScrollOffset: CGFloat = 0  // for scroll direction detection
    @State private var isCategoryPinned = false  // true when category tabs are stuck at top
    @State private var loadError: String?
    @State private var showCart = false
    @State private var showAccountPage = false
    @State private var showCategoryMenu = false
    @State private var pendingScrollCategory: String? = nil  // set by menu sheet, consumed by ScrollViewReader
    @State private var isGridView = false  // false = list view, true = grid view

    /// Live delivery address: prefer LocationManager's current address, fall back to saved
    private var displayAddress: String {
        if !locationManager.address.isEmpty {
            return locationManager.address
        }
        return UserDefaults.standard.string(forKey: "berhot_saved_address") ?? ""
    }

    private let brandYellow = Color(hex: "FFD300")

    /// Time-based greeting using Riyadh timezone (Asia/Riyadh, UTC+3)
    private var greetingText: String {
        let tz = TimeZone(identifier: "Asia/Riyadh") ?? .current
        var cal = Calendar.current
        cal.timeZone = tz
        let hour = cal.component(.hour, from: Date())
        if hour < 12 { return "Good morning" }
        if hour < 17 { return "Good afternoon" }
        return "Good evening"
    }

    private var greetingEmoji: String {
        let tz = TimeZone(identifier: "Asia/Riyadh") ?? .current
        var cal = Calendar.current
        cal.timeZone = tz
        let hour = cal.component(.hour, from: Date())
        if hour < 12 { return "☀️" }
        if hour < 17 { return "🌤️" }
        return "🌙"
    }

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                Color.white.ignoresSafeArea()

                ScrollViewReader { scrollProxy in
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 0) {
                            // ── Top Header (always visible) ──
                            topHeaderSection

                            if isLoading {
                                // ── Skeleton for content below header ──
                                HomeSkeletonContent()
                            } else if let error = loadError, products.isEmpty {
                                // ── Error state (only when no cached data) ──
                                ErrorView(message: error) {
                                    Task { await loadData() }
                                }
                                .padding(.top, 60)
                            } else {
                                // ── Promo Banner / Slider ──
                                if bannerSettings?.bannerEnabled == true, !banners.isEmpty {
                                    bannerSection
                                        .padding(.bottom, 1)
                                }

                                // ── Sticky Category Tabs ──
                                LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
                                    Section {
                                        // ── Products grouped by category with titles ──
                                        productsSectionWithAnchors
                                            .padding(.horizontal, 20)
                                    } header: {
                                        VStack(spacing: 0) {
                                            categoryTabs(scrollProxy: scrollProxy)
                                                .padding(.top, 10)
                                                .padding(.bottom, 10)
                                        }
                                        .background(
                                            GeometryReader { geo in
                                                // When pinned, minY in global is near top (~59 safe area)
                                                // When not pinned, minY is much larger
                                                Color.white
                                                    .padding(.top, isCategoryPinned ? -600 : 0)
                                                    .edgesIgnoringSafeArea(isCategoryPinned ? .all : [])
                                                    .onChange(of: geo.frame(in: .global).minY) { newY in
                                                        // Category tabs are "pinned" when near top of safe area (~60pt)
                                                        let pinned = newY < 100
                                                        if pinned != isCategoryPinned {
                                                            isCategoryPinned = pinned
                                                        }
                                                    }
                                                    .onAppear {
                                                        let y = geo.frame(in: .global).minY
                                                        isCategoryPinned = y < 100
                                                    }
                                            }
                                        )
                                        .zIndex(1)
                                    }
                                }
                            }
                        }
                    }
                    .background(
                        GeometryReader { geo in
                            Color.clear
                                .onChange(of: geo.frame(in: .global).minY) { newY in
                                    let delta = newY - lastScrollOffset
                                    if abs(delta) > 10 {
                                        if delta < 0 && tabBarVisibility.isVisible {
                                            // Scrolling DOWN → hide tab bar
                                            tabBarVisibility.isVisible = false
                                        } else if delta > 0 && !tabBarVisibility.isVisible {
                                            // Scrolling UP → show tab bar
                                            tabBarVisibility.isVisible = true
                                        }
                                        lastScrollOffset = newY
                                    }
                                }
                        }
                    )
                    // Scroll to category selected from the menu sheet
                    .onChange(of: pendingScrollCategory) { target in
                        guard let target = target else { return }
                        isTapScrolling = true
                        let scrollId = target == "__all__" ? "products_top" : "scroll_\(target)"
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                            withAnimation(.easeInOut(duration: 0.3)) {
                                scrollProxy.scrollTo(scrollId, anchor: .top)
                            }
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                            isTapScrolling = false
                        }
                        pendingScrollCategory = nil
                    }
                }

                // Floating Cart Button
                if !cartManager.isEmpty {
                    VStack(spacing: 0) {
                        floatingCartButton
                    }
                    .background(
                        Color.white
                            .edgesIgnoringSafeArea(.bottom)
                    )
                }
            }
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(isPresented: $showCart) {
                CartView()
            }
            .navigationDestination(isPresented: $showAccountPage) {
                ProfileView()
            }
            .sheet(isPresented: $showProfile) {
                NavigationStack { ProfileView() }
            }
            .sheet(item: $selectedProduct) { product in
                ProductDetailView(product: product)
            }
            .sheet(isPresented: $showLocationPicker) {
                LocationChangeView(locationManager: locationManager)
            }
            .overlay {
                if showCategoryMenu {
                    // Dim background
                    Color.black.opacity(0.4)
                        .ignoresSafeArea()
                        .onTapGesture { withAnimation(.easeOut(duration: 0.25)) { showCategoryMenu = false } }

                    // Bottom panel — edge to edge
                    VStack(spacing: 0) {
                        Spacer()
                        CategoryMenuSheet(
                            categories: categories,
                            selectedCategory: $selectedCategory,
                            onSelect: { catId in
                                selectedCategory = catId == "__all__" ? nil : catId
                                pendingScrollCategory = catId
                                withAnimation(.easeOut(duration: 0.25)) { showCategoryMenu = false }
                            },
                            onDismiss: { withAnimation(.easeOut(duration: 0.25)) { showCategoryMenu = false } }
                        )
                        .frame(height: UIScreen.main.bounds.height * 0.6)
                    }
                    .ignoresSafeArea(.container, edges: .bottom)
                    .transition(.move(edge: .bottom))
                }
            }
            .animation(.easeOut(duration: 0.25), value: showCategoryMenu)
            .fullScreenCover(isPresented: $showSearchView) {
                SearchView(
                    products: products,
                    categories: categories,
                    deliveryMode: deliveryMode
                )
                .environmentObject(cartManager)
            }
        }
        .task { await loadData() }
        .onAppear {
            // If location is already authorized but no address yet, auto-geocode
            resolveAddressIfNeeded()
        }
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
            // Refresh banners whenever app comes back to foreground
            Task { await loadBanners() }
        }
    }

    /// Auto-geocode current location if permission was granted but address not yet resolved
    private func resolveAddressIfNeeded() {
        let status = locationManager.authorizationStatus
        let hasSaved = UserDefaults.standard.string(forKey: "berhot_saved_address") != nil
        if (status == .authorizedWhenInUse || status == .authorizedAlways) && !hasSaved && locationManager.address.isEmpty {
            locationManager.requestLocation()
        }
    }

    // MARK: - Top Header (matching screenshot design exactly)
    private var topHeaderSection: some View {
        VStack(spacing: 0) {
            VStack(spacing: 0) {

                // ── Row 1: Greeting + Name | Burger menu ──
                HStack(alignment: .center, spacing: 0) {
                    // Greeting text + name + emoji
                    HStack(spacing: 0) {
                        Text(greetingText + ", ")
                            .font(.system(size: 16))
                            .foregroundColor(.black)
                        if let name = authManager.currentUser?.firstName, !name.isEmpty {
                            Text(name + "!")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.black)
                        }
                        Text(" " + greetingEmoji)
                            .font(.system(size: 15))
                    }

                    Spacer()

                    // Berhot logo + Burger menu — opens Account page via push navigation
                    Button { showAccountPage = true } label: {
                        HStack(spacing: 10) {
                            BerhotLogoIcon(size: 22, color: .black)
                            Image(systemName: "line.3.horizontal")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundColor(.black)
                        }
                        .frame(height: 36)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                .padding(.bottom, 10)

                // ── [Deliver now / Address] left | [Delivery/Pick up toggle] right ──
                HStack(alignment: .center, spacing: 0) {
                    // Left: "Deliver now" stacked on address (no gap)
                    Button {
                        showLocationPicker = true
                    } label: {
                        VStack(alignment: .leading, spacing: 0) {
                            Text("Deliver now")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(Color(hex: "999999"))
                                .padding(.bottom, 3)

                            HStack(spacing: 4) {
                                if locationManager.isGeocoding {
                                    Text("Getting location...")
                                        .font(.system(size: 15, weight: .medium))
                                        .foregroundColor(.black.opacity(0.5))
                                        .lineLimit(1)
                                } else {
                                    Text(displayAddress.isEmpty ? "Set delivery address" : displayAddress)
                                        .font(.system(size: 15, weight: .medium))
                                        .foregroundColor(.black.opacity(0.7))
                                        .lineLimit(1)
                                        .truncationMode(.tail)
                                }

                                Image(systemName: "chevron.down")
                                    .font(.system(size: 10, weight: .semibold))
                                    .foregroundColor(.black.opacity(0.6))
                            }
                            .frame(maxWidth: UIScreen.main.bounds.width * 0.55, alignment: .leading)
                        }
                    }

                    Spacer(minLength: 4)

                    // Right: Delivery / Pick up toggle
                    deliveryToggleCompact
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 12)

                // ── Row 3: Search bar ──
                Button {
                    showSearchView = true
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(Color(hex: "AAAAAA"))
                        Text(store?.name != nil ? "Search \(store!.name)" : "Search Berhot Cafe")
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "AAAAAA"))
                        Spacer()
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 15)
                    .background(Color(hex: "F3F3F3"))
                    .cornerRadius(12)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 0)
//
//                Divider()
//                    .padding(.horizontal, 20)
            }
//            .background(Color(hex: "e9f3ff"))
            .background(Color.white)
        }
    }

    // MARK: - Compact Delivery/Pick up Toggle
    private var deliveryToggleCompact: some View {
        HStack(spacing: 0) {
            ForEach(Array(["Delivery", "Pick up"].enumerated()), id: \.offset) { index, label in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) { deliveryMode = index }
                } label: {
                    Text(label)
                        .font(.system(size: 13, weight: deliveryMode == index ? .bold : .medium))
                        .foregroundColor(deliveryMode == index ? .black : Color(hex: "999999"))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 7)
                        .background(deliveryMode == index ? Color.white : Color.clear)
                        .cornerRadius(18)
                        .shadow(color: deliveryMode == index ? .black.opacity(0.06) : .clear, radius: 2, y: 1)
                }
            }
        }
        .padding(3)
        .background(Color(hex: "EFEFEF"))
        .cornerRadius(22)
    }

    // MARK: - Category Tabs (underline style)
    private func categoryTabs(scrollProxy: ScrollViewProxy) -> some View {
        VStack(spacing: 0) {
            // ── Category names with underline indicator ──
            ScrollViewReader { tabProxy in
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(alignment: .center, spacing: 16) {
                        // Grid / List toggle
                        Button {
                            withAnimation(.easeInOut(duration: 0.2)) { isGridView.toggle() }
                        } label: {
                            Image(systemName: isGridView ? "list.bullet" : "square.grid.2x2")
                                .font(.system(size: 19, weight: .medium))
                                .foregroundColor(.black)
                                .padding(.bottom, 5)
                        }

                        HStack(alignment: .center, spacing: 18) {
                        CategoryUnderlineTab(name: "All", isSelected: selectedCategory == nil) {
                            isTapScrolling = true
                            selectedCategory = nil
                            withAnimation(.easeInOut(duration: 0.3)) {
                                scrollProxy.scrollTo("products_top", anchor: .top)
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { isTapScrolling = false }
                        }
                        .id("tab_all")

                        ForEach(categories) { cat in
                            CategoryUnderlineTab(name: cat.name, isSelected: selectedCategory == cat.id) {
                                isTapScrolling = true
                                selectedCategory = cat.id
                                withAnimation(.easeInOut(duration: 0.3)) {
                                    scrollProxy.scrollTo("scroll_\(cat.id)", anchor: .top)
                                }
                                withAnimation(.easeInOut(duration: 0.2)) {
                                    tabProxy.scrollTo("tab_\(cat.id)", anchor: .center)
                                }
                                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { isTapScrolling = false }
                            }
                            .id("tab_\(cat.id)")
                        }
                        }
                        .background(alignment: .bottom) {
                            // Gray bar starting from All, extending to right edge
                            Rectangle()
                                .fill(Color(hex: "f0f0f0"))
                                .frame(height: 4)
                                .padding(.trailing, -500) // extend far to right edge of screen
                        } // end inner HStack
                    }
                    .padding(.horizontal, 18)
                }
                // Keep the tab strip centered on the active category
                .onChange(of: selectedCategory) { newVal in
                    if let id = newVal {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            tabProxy.scrollTo("tab_\(id)", anchor: .center)
                        }
                    } else {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            tabProxy.scrollTo("tab_all", anchor: .center)
                        }
                    }
                }
            }

            // ── Filter chips (hidden for now — uncomment when needed) ──
            // ScrollView(.horizontal, showsIndicators: false) {
            //     HStack(spacing: 8) {
            //         HomeFilterChip(label: "Offers", icon: "tag.fill")
            //         HomeFilterChip(label: "Delivery fee", icon: nil, showChevron: true)
            //         HomeFilterChip(label: "Under 30 min", icon: nil)
            //         HomeFilterChip(label: "Highest rated", icon: "star.fill")
            //     }
            //     .padding(.horizontal, 16)
            // }

        }
    }

    // MARK: - Products Section (with category titles + scroll-detection)
    private var productsSectionWithAnchors: some View {
        VStack(spacing: 4) {
            Color.clear.frame(height: 0).id("products_top")

            ForEach(Array(sortedCategoryKeys.enumerated()), id: \.element) { index, categoryName in
                if let items = groupedProducts[categoryName] {
                    let catId = categoryIdFor(name: categoryName)

                    // Invisible scroll target for tap-to-scroll
                    Color.clear.frame(height: 0).id("scroll_\(catId)")

                    // Category title with position tracking + scroll anchor
                    CategoryHeaderView(
                        name: categoryName,
                        catId: catId,
                        isFirst: index == 0,
                        isGridView: isGridView,
                        onPositionChange: { id, minY in
                            guard !isTapScrolling else { return }
                            categoryPositionChanged(id: id, minY: minY)
                        }
                    )
                    .id("cat_\(catId)")

                    if isGridView {
                        // ── Grid View: 2-column grid ──
                        productGrid(items: items)
                    } else {
                        // ── List View: full-width rows ──
                        ForEach(Array(items.enumerated()), id: \.element.id) { index, product in
                            let available = isProductAvailable(product)
                            ProductListRow(product: product, tagType: productTagType(index: index, product: product), isLast: index == items.count - 1, discountPrice: discountPrice(for: product), isAvailable: available, showDescription: shouldShowDescription(product), onAdd: {
                                guard available else { return }
                                if product.needsModifierSelection {
                                    selectedProduct = product
                                } else {
                                    cartManager.addItem(product: product)
                                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                }
                            }, onTap: {
                                guard available else { return }
                                selectedProduct = product
                            })
                        }
                    }

                    // Bottom padding after last product before next category divider
                    Spacer().frame(height: 10)
                }
            }
        }
    }

    // MARK: - Product Grid (2 columns)
    /// Returns tag type for a product: first item = Popular, some others = Hot 🔥
    private func productTagType(index: Int, product: Product) -> ProductTagType? {
        if index == 0 { return .popular }
        // Consistent "Hot" tag based on product id hash — roughly every 3rd product
        let hash = abs(product.id.hashValue)
        if hash % 3 == 0 { return .hot }
        return nil
    }

    /// Returns a discount price for some products (consistent via hash)
    /// Roughly every 4th product gets a discount of 15-30%
    private func discountPrice(for product: Product) -> Double? {
        let hash = abs(product.id.hashValue)
        guard hash % 4 == 1 else { return nil }
        // Discount between 15% and 30%
        let discountPercent = 15 + (hash % 16) // 15-30
        let discounted = product.price * (1.0 - Double(discountPercent) / 100.0)
        return (discounted * 100).rounded() / 100 // Round to 2 decimals
    }

    /// Some products are marked unavailable for demo (consistent via hash)
    /// Roughly every 5th product is unavailable
    private func isProductAvailable(_ product: Product) -> Bool {
        let hash = abs(product.id.hashValue)
        return hash % 5 != 2
    }

    /// Some products have no description for demo variety (consistent via hash)
    /// Roughly every 3rd product hides description
    private func shouldShowDescription(_ product: Product) -> Bool {
        let hash = abs(product.id.hashValue)
        return hash % 3 != 1
    }

    private func productGrid(items: [Product]) -> some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: 10), count: 2)
        return LazyVGrid(columns: columns, spacing: 10) {
            ForEach(Array(items.enumerated()), id: \.element.id) { index, product in
                let available = isProductAvailable(product)
                ProductGridCard(product: product, tagType: productTagType(index: index, product: product), discountPrice: discountPrice(for: product), isAvailable: available, showDescription: shouldShowDescription(product), onAdd: {
                    guard available else { return }
                    if product.needsModifierSelection {
                        selectedProduct = product
                    } else {
                        cartManager.addItem(product: product)
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    }
                }, onTap: {
                    guard available else { return }
                    selectedProduct = product
                })
            }
        }
    }

    /// Sorted category names in display order
    private var sortedCategoryKeys: [String] {
        groupedProducts.keys.sorted { a, b in
            let aIdx = categories.firstIndex(where: { $0.name == a }) ?? 999
            let bIdx = categories.firstIndex(where: { $0.name == b }) ?? 999
            return aIdx < bIdx
        }
    }

    /// Called continuously as each category header scrolls
    private func categoryPositionChanged(id: String, minY: CGFloat) {
        // Update this header's position
        categoryPositions[id] = minY

        guard !isTapScrolling else { return }

        // The pinned header (just category tabs) sits at roughly 50pt tall
        // A category "owns" the view when its header has scrolled up to or past this line
        let threshold: CGFloat = 120

        // Find all categories whose header is at or above the threshold (scrolled past it)
        // The active one is the LAST in display order that crossed the threshold
        var best: String? = nil
        for cat in categories {
            if let y = categoryPositions[cat.id], y <= threshold {
                best = cat.id  // keep overwriting — last one in order wins
            }
        }

        if let best = best {
            if selectedCategory != best {
                selectedCategory = best
            }
        } else if selectedCategory != nil {
            // All headers are below threshold — user scrolled back above first category
            selectedCategory = nil
        }
    }

    /// Map category name back to its ID for scroll anchoring
    private func categoryIdFor(name: String) -> String {
        categories.first(where: { $0.name == name })?.id ?? name
    }

    // MARK: - Floating Cart + Free Delivery Bar
    private let freeDeliveryThreshold: Double = 100.0

    private var floatingCartButton: some View {
        VStack(spacing: 0) {
            // ── Free Delivery Progress Bar (white bg, no gap to button) ──
            freeDeliveryBar

            // ── Cart Button (black) ──
            Button {
                showCart = true
            } label: {
                HStack(spacing: 0) {
                    HStack(spacing: 8) {
                        Text("View Cart")
                            .font(.system(size: 16, weight: .bold))

                        Text("\(cartManager.itemCount)")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.black)
                            .frame(width: 22, height: 22)
                            .background(Color.white)
                            .clipShape(Circle())
                    }

                    Spacer()

                    Text(cartManager.total.formattedCurrency)
                        .font(.system(size: 16, weight: .bold))
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .background(Color.black)
                .foregroundColor(.white)
                .cornerRadius(14)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
        }
    }

    // MARK: - Free Delivery Progress Bar
    private var freeDeliveryBar: some View {
        let subtotal = cartManager.subtotal
        let remaining = max(freeDeliveryThreshold - subtotal, 0)
        let progress = min(subtotal / freeDeliveryThreshold, 1.0)
        let isFree = subtotal >= freeDeliveryThreshold

        return VStack(spacing: 8) {
            // Message row
            HStack(spacing: 6) {
                Image(systemName: isFree ? "checkmark.circle.fill" : "shippingbox.fill")
                    .font(.system(size: 14))
                    .foregroundColor(isFree ? Color(hex: "43A047") : Color(hex: "E65100"))

                if isFree {
                    Text("You've unlocked free delivery!")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(Color(hex: "43A047"))
                } else {
                    Text("Add ")
                        .font(.system(size: 13, weight: .regular))
                        .foregroundColor(Color(hex: "555555"))
                    + Text(remaining.formattedCurrency)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(Color(hex: "E65100"))
                    + Text(" more for free delivery")
                        .font(.system(size: 13, weight: .regular))
                        .foregroundColor(Color(hex: "555555"))
                }

                Spacer()
            }

            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color(hex: "EEEEEE"))
                        .frame(height: 4)

                    RoundedRectangle(cornerRadius: 3)
                        .fill(
                            isFree
                                ? AnyShapeStyle(Color(hex: "43A047"))
                                : AnyShapeStyle(LinearGradient(
                                    colors: [Color(hex: "FF6D00"), Color(hex: "E65100")],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                  ))
                        )
                        .frame(width: geo.size.width * progress, height: 4)
                        .animation(.easeInOut(duration: 0.4), value: progress)
                }
            }
            .frame(height: 4)
        }
        .padding(.horizontal, 20)
        .padding(.top, 12)
        .padding(.bottom, 12)
        .background(Color.white)
    }

    // MARK: - Helpers
    private var groupedProducts: [String: [Product]] {
        // Always show all products (no filtering) — scrolling handles navigation
        Dictionary(grouping: products) { p in
            p.categoryName ?? p.category?.name ?? "Other"
        }
    }

    private func loadData() async {
        let cache = HomeDataCache.shared

        // If cached data exists, use it immediately (no skeleton)
        if cache.hasCachedData {
            store = cache.store
            products = cache.products ?? []
            categories = cache.categories ?? []
            bannerSettings = cache.bannerSettings
            banners = cache.banners ?? []
            isLoading = false

            // Refresh data silently in the background
            await refreshData()
            return
        }

        // First load — show skeleton
        isLoading = true
        await refreshData()
        isLoading = false

        // Load banners (non-blocking)
        await loadBanners()
    }

    /// Fetch fresh data from API and update cache
    private func refreshData() async {
        loadError = nil
        do {
            async let storeTask = StoreService.fetchStoreInfo()
            async let productsTask = ProductService.fetchProducts()
            async let categoriesTask = ProductService.fetchCategories()
            let (s, p, c) = try await (storeTask, productsTask, categoriesTask)
            store = s; products = p; categories = c

            // Update cache
            let cache = HomeDataCache.shared
            cache.store = s
            cache.products = p
            cache.categories = c
        } catch {
            print("Home data load error: \(error)")
            print("  → Base URL: \(AppConfig.posBaseURL)")
            print("  → Tenant ID: \(AppConfig.tenantId)")
            print("  → Demo mode: \(AppConfig.demoMode)")
            // Silently skip — don't block the UI
        }

        // Fetch saved address from backend (alongside other data)
        if locationManager.address.isEmpty {
            await locationManager.fetchSavedAddress(customerId: authManager.currentUser?.id)
        }

        // Also refresh banners
        await loadBanners()
    }

    private func loadBanners() async {
        let base = AppConfig.posBaseURL
        do {
            // Fetch settings
            guard let settingsURL = URL(string: "\(base)/api/v1/pos/app-settings") else { return }
            var req = URLRequest(url: settingsURL)
            req.setValue(AppConfig.demoTenantId, forHTTPHeaderField: "X-Tenant-ID")
            let (settingsData, _) = try await URLSession.shared.data(for: req)
            let decoded = try JSONDecoder().decode(BannerSettings.self, from: settingsData)
            bannerSettings = decoded

            guard decoded.bannerEnabled else {
                banners = []
                return
            }

            // Fetch banners
            guard let bannersURL = URL(string: "\(base)/api/v1/pos/app-banners") else { return }
            var breq = URLRequest(url: bannersURL)
            breq.setValue(AppConfig.demoTenantId, forHTTPHeaderField: "X-Tenant-ID")
            let (bannersData, _) = try await URLSession.shared.data(for: breq)
            let bResp = try JSONDecoder().decode(BannersResponse.self, from: bannersData)
            // Convert relative URLs to absolute using POS base URL
            banners = bResp.banners.filter { $0.isActive }.map { banner in
                var b = banner
                if b.imageUrl.hasPrefix("/") {
                    b.imageUrl = base + b.imageUrl
                }
                return b
            }

            // Cache banners
            let cache = HomeDataCache.shared
            cache.bannerSettings = decoded
            cache.banners = banners

            // Start auto-slide timer if slider mode
            if decoded.bannerMode == "slider" && banners.count > 1 {
                startBannerTimer(interval: decoded.autoSlideInterval)
            }
        } catch {
            print("Banner load error: \(error)")
        }
    }

    private func startBannerTimer(interval: Int) {
        bannerTimer?.invalidate()
        bannerTimer = Timer.scheduledTimer(withTimeInterval: TimeInterval(interval), repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.4)) {
                currentBannerIndex = (currentBannerIndex + 1) % max(banners.count, 1)
            }
        }
    }

    // MARK: - Banner Section
    private var bannerSection: some View {
        VStack(spacing: 6) {
            TabView(selection: $currentBannerIndex) {
                ForEach(Array(banners.enumerated()), id: \.element.id) { index, banner in
                    ZStack(alignment: .bottomLeading) {
                        AsyncImage(url: URL(string: banner.imageUrl)) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(height: 130)
                                    .clipped()
                            case .failure:
                                Rectangle()
                                    .fill(Color.gray.opacity(0.2))
                                    .frame(height: 130)
                            default:
                                Rectangle()
                                    .fill(Color.gray.opacity(0.1))
                                    .frame(height: 130)
                                    .overlay(ProgressView())
                            }
                        }

                        // Gradient shadow + overlay text
                        if banner.hasAnyOverlayContent {
                            LinearGradient(
                                colors: [.clear, .black.opacity(0.55)],
                                startPoint: .center,
                                endPoint: .bottom
                            )
                            .frame(height: 130)

                            VStack(alignment: .leading, spacing: 2) {
                                if !banner.displayTitle.isEmpty {
                                    Text(banner.displayTitle)
                                        .font(.system(size: 16, weight: .bold))
                                        .foregroundColor(.white)
                                        .shadow(color: .black.opacity(0.3), radius: 2, y: 1)
                                }
                                if !banner.displayDescription.isEmpty {
                                    Text(banner.displayDescription)
                                        .font(.system(size: 12))
                                        .foregroundColor(.white.opacity(0.9))
                                        .shadow(color: .black.opacity(0.3), radius: 2, y: 1)
                                }
                            }
                            .padding(.horizontal, 14)
                            .padding(.bottom, 10)
                        }
                    }
                    .frame(height: 130)
                    .cornerRadius(14)
                    .padding(.horizontal, 20)
                    .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .frame(height: 138)

            // Page dots for slider mode
            if bannerSettings?.bannerMode == "slider" && banners.count > 1 {
                HStack(spacing: 5) {
                    ForEach(0..<banners.count, id: \.self) { i in
                        Capsule()
                            .fill(i == currentBannerIndex ? Color.black.opacity(0.7) : Color.black.opacity(0.2))
                            .frame(width: i == currentBannerIndex ? 16 : 6, height: 6)
                            .animation(.easeInOut(duration: 0.2), value: currentBannerIndex)
                    }
                }
            }
        }
        .padding(.top, 10)
        .padding(.bottom, 4)
//        .background(
//            LinearGradient(
//                colors: [Color(hex: "e9f3ff"), Color.clear],
//                startPoint: .top,
//                endPoint: .bottom
//            )
//        )
        .background(Color.white)
    }
}

// MARK: - Banner Models
struct BannerSettings: Codable {
    let bannerEnabled: Bool
    let bannerMode: String
    let autoSlideInterval: Int

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        bannerEnabled = try c.decodeIfPresent(Bool.self, forKey: .bannerEnabled) ?? false
        bannerMode = try c.decodeIfPresent(String.self, forKey: .bannerMode) ?? "single"
        autoSlideInterval = try c.decodeIfPresent(Int.self, forKey: .autoSlideInterval) ?? 5
    }
}

struct HomeBanner: Codable, Identifiable {
    let id: String
    var imageUrl: String
    let linkUrl: String
    let linkType: String
    let title: String
    let description: String
    let sortOrder: Int
    let isActive: Bool
    var showOverlay: Bool
    var overlayTitle: String
    var overlayDescription: String

    enum CodingKeys: String, CodingKey {
        case id, imageUrl, linkUrl, linkType, title, description, sortOrder, isActive
        case showOverlay, overlayTitle, overlayDescription
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        imageUrl = try c.decode(String.self, forKey: .imageUrl)
        linkUrl = try c.decodeIfPresent(String.self, forKey: .linkUrl) ?? ""
        linkType = try c.decodeIfPresent(String.self, forKey: .linkType) ?? "external"
        title = try c.decodeIfPresent(String.self, forKey: .title) ?? ""
        description = try c.decodeIfPresent(String.self, forKey: .description) ?? ""
        sortOrder = try c.decodeIfPresent(Int.self, forKey: .sortOrder) ?? 0
        isActive = try c.decodeIfPresent(Bool.self, forKey: .isActive) ?? true
        showOverlay = try c.decodeIfPresent(Bool.self, forKey: .showOverlay) ?? false
        overlayTitle = try c.decodeIfPresent(String.self, forKey: .overlayTitle) ?? ""
        overlayDescription = try c.decodeIfPresent(String.self, forKey: .overlayDescription) ?? ""
    }

    /// Title to display: prefer overlayTitle if overlay is on, else fall back to banner title
    var displayTitle: String {
        if showOverlay && !overlayTitle.isEmpty { return overlayTitle }
        return title
    }

    /// Description to display: prefer overlayDescription, fall back to description
    var displayDescription: String {
        if showOverlay && !overlayDescription.isEmpty { return overlayDescription }
        return description
    }

    /// Whether there is any overlay content to show (title or description)
    var hasAnyOverlayContent: Bool {
        !displayTitle.isEmpty || !displayDescription.isEmpty
    }

    init(id: String, imageUrl: String, linkUrl: String = "", linkType: String = "external", title: String = "", description: String = "", sortOrder: Int = 0, isActive: Bool = true, showOverlay: Bool = false, overlayTitle: String = "", overlayDescription: String = "") {
        self.id = id
        self.imageUrl = imageUrl
        self.linkUrl = linkUrl
        self.linkType = linkType
        self.title = title
        self.description = description
        self.sortOrder = sortOrder
        self.isActive = isActive
        self.showOverlay = showOverlay
        self.overlayTitle = overlayTitle
        self.overlayDescription = overlayDescription
    }
}

struct BannersResponse: Codable {
    let banners: [HomeBanner]
}

// MARK: - Saudi Riyal Symbol Shape (official SVG paths from dashboard)
struct RiyalShape: Shape {
    func path(in rect: CGRect) -> Path {
        let w = rect.width
        let h = rect.height
        // Original viewBox: 0 0 1124 1257
        let sx = w / 1124.0
        let sy = h / 1257.0

        var path = Path()

        // Path 1: bottom-right stroke
        path.move(to: CGPoint(x: 699.62 * sx, y: 1113.02 * sy))
        path.addCurve(
            to: CGPoint(x: 661.22 * sx, y: 1256.39 * sy),
            control1: CGPoint(x: 679.56 * sx, y: 1157.50 * sy),
            control2: CGPoint(x: 666.30 * sx, y: 1205.77 * sy)
        )
        path.addLine(to: CGPoint(x: 1085.73 * sx, y: 1166.15 * sy))
        path.addCurve(
            to: CGPoint(x: 1124.13 * sx, y: 1022.78 * sy),
            control1: CGPoint(x: 1105.79 * sx, y: 1121.68 * sy),
            control2: CGPoint(x: 1119.04 * sx, y: 1073.40 * sy)
        )
        path.closeSubpath()

        // Path 2: main riyal body
        path.move(to: CGPoint(x: 1085.73 * sx, y: 895.80 * sy))
        path.addCurve(
            to: CGPoint(x: 1124.13 * sx, y: 752.43 * sy),
            control1: CGPoint(x: 1105.79 * sx, y: 851.33 * sy),
            control2: CGPoint(x: 1119.05 * sx, y: 803.05 * sy)
        )
        path.addLine(to: CGPoint(x: 793.45 * sx, y: 822.76 * sy))
        path.addLine(to: CGPoint(x: 793.45 * sx, y: 687.56 * sy))
        path.addLine(to: CGPoint(x: 1085.72 * sx, y: 625.45 * sy))
        path.addCurve(
            to: CGPoint(x: 1124.12 * sx, y: 482.08 * sy),
            control1: CGPoint(x: 1105.78 * sx, y: 580.98 * sy),
            control2: CGPoint(x: 1119.04 * sx, y: 532.70 * sy)
        )
        path.addLine(to: CGPoint(x: 793.44 * sx, y: 552.35 * sy))
        path.addLine(to: CGPoint(x: 793.44 * sx, y: 66.13 * sy))
        path.addCurve(
            to: CGPoint(x: 661.19 * sx, y: 177.12 * sy),
            control1: CGPoint(x: 742.77 * sx, y: 94.58 * sy),
            control2: CGPoint(x: 697.77 * sx, y: 132.45 * sy)
        )
        path.addLine(to: CGPoint(x: 661.19 * sx, y: 580.47 * sy))
        path.addLine(to: CGPoint(x: 528.94 * sx, y: 608.58 * sy))
        path.addLine(to: CGPoint(x: 528.94 * sx, y: 0 * sy))
        path.addCurve(
            to: CGPoint(x: 396.69 * sx, y: 110.99 * sy),
            control1: CGPoint(x: 478.27 * sx, y: 28.44 * sy),
            control2: CGPoint(x: 433.27 * sx, y: 66.32 * sy)
        )
        path.addLine(to: CGPoint(x: 396.69 * sx, y: 636.68 * sy))
        path.addLine(to: CGPoint(x: 100.78 * sx, y: 699.56 * sy))
        path.addCurve(
            to: CGPoint(x: 62.36 * sx, y: 842.93 * sy),
            control1: CGPoint(x: 80.72 * sx, y: 744.03 * sy),
            control2: CGPoint(x: 67.45 * sx, y: 792.31 * sy)
        )
        path.addLine(to: CGPoint(x: 396.69 * sx, y: 771.88 * sy))
        path.addLine(to: CGPoint(x: 396.69 * sx, y: 942.14 * sy))
        path.addLine(to: CGPoint(x: 38.39 * sx, y: 1018.28 * sy))
        path.addCurve(
            to: CGPoint(x: 0 * sx, y: 1161.65 * sy),
            control1: CGPoint(x: 18.33 * sx, y: 1062.75 * sy),
            control2: CGPoint(x: 5.07 * sx, y: 1111.03 * sy)
        )
        path.addLine(to: CGPoint(x: 375.04 * sx, y: 1081.95 * sy))
        path.addCurve(
            to: CGPoint(x: 448.87 * sx, y: 1032.71 * sy),
            control1: CGPoint(x: 405.57 * sx, y: 1075.60 * sy),
            control2: CGPoint(x: 431.81 * sx, y: 1057.55 * sy)
        )
        path.addLine(to: CGPoint(x: 517.65 * sx, y: 930.74 * sy))
        path.addCurve(
            to: CGPoint(x: 528.95 * sx, y: 893.77 * sy),
            control1: CGPoint(x: 524.79 * sx, y: 920.19 * sy),
            control2: CGPoint(x: 528.95 * sx, y: 907.47 * sy)
        )
        path.addLine(to: CGPoint(x: 528.95 * sx, y: 743.79 * sy))
        path.addLine(to: CGPoint(x: 661.20 * sx, y: 715.68 * sy))
        path.addLine(to: CGPoint(x: 661.20 * sx, y: 986.08 * sy))
        path.addLine(to: CGPoint(x: 1085.73 * sx, y: 895.80 * sy))
        path.closeSubpath()

        return path
    }
}

// MARK: - Saudi Riyal Icon View
struct SaudiRiyalIcon: View {
    let size: CGFloat
    let color: Color

    init(size: CGFloat = 12, color: Color = Color(hex: "555555")) {
        self.size = size
        self.color = color
    }

    var body: some View {
        RiyalShape()
            .fill(color)
            .frame(width: size, height: size * (1257.0 / 1124.0))
    }
}

// MARK: - Price + Kcal row helper
struct PriceKcalRow: View {
    let price: Double
    let fontSize: CGFloat
    let kcal: Int
    let discountPrice: Double?

    init(price: Double, fontSize: CGFloat = 13, kcal: Int = 0, discountPrice: Double? = nil) {
        self.price = price
        self.fontSize = fontSize
        self.kcal = kcal
        self.discountPrice = discountPrice
    }

    var body: some View {
        HStack(spacing: 4) {
            if let discountPrice {
                // Old price with strikethrough line across number + riyal
                HStack(spacing: 2) {
                    Text(String(format: "%.0f", price))
                        .font(.system(size: fontSize - 1, weight: .regular))
                        .foregroundColor(Color(hex: "AAAAAA"))

                    SaudiRiyalIcon(size: fontSize - 3, color: Color(hex: "AAAAAA"))
                }
                .overlay(
                    Rectangle()
                        .fill(Color(hex: "AAAAAA"))
                        .frame(height: 1)
                )

                // New discounted price in red
                HStack(spacing: 2) {
                    Text(String(format: "%.0f", discountPrice))
                        .font(.system(size: fontSize, weight: .semibold))
                        .foregroundColor(Color(hex: "D32F2F"))

                    SaudiRiyalIcon(size: fontSize - 2, color: Color(hex: "D32F2F"))
                }
            } else {
                // Regular price
                Text(String(format: "%.0f", price))
                    .font(.system(size: fontSize, weight: .semibold))
                    .foregroundColor(Color(hex: "444444"))

                SaudiRiyalIcon(size: fontSize - 2, color: Color(hex: "444444"))
            }
        }
    }
}

// MARK: - Popular Tag
enum ProductTagType {
    case popular
    case hot

    var label: String {
        switch self {
        case .popular: return "Popular"
        case .hot: return "Hot"
        }
    }

    var textColor: Color {
        switch self {
        case .popular: return .white
        case .hot: return .white
        }
    }

    var bgColor: Color {
        switch self {
        case .popular: return Color(hex: "2E7D32")
        case .hot: return Color(hex: "D32F2F")
        }
    }
}

struct ProductTag: View {
    let type: ProductTagType

    var body: some View {
        HStack(spacing: 3) {
            Text(type.label)
                .font(.system(size: 12, weight: .semibold))
            if type == .hot {
                Image(systemName: "flame.fill")
                    .font(.system(size: 10))
            }
        }
        .foregroundColor(type.textColor)
        .padding(.horizontal, 6)
        .padding(.vertical, 3)
        .background(type.bgColor)
        .cornerRadius(4)
    }
}

// MARK: - Product "+" Add Button
struct ProductAddButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: "plus")
                .font(.system(size: 17, weight: .medium))
                .foregroundColor(Color(hex: "555555"))
                .frame(width: 34, height: 34)
                .background(Color.white)
                .clipShape(Circle())
                .overlay(Circle().stroke(Color(hex: "E0E0E0"), lineWidth: 0.5))
                .shadow(color: .black.opacity(0.06), radius: 1, y: 1)
        }
    }
}

// MARK: - Product List Row (text left, image right — flat with divider)
struct ProductListRow: View {
    let product: Product
    let tagType: ProductTagType?
    let isLast: Bool
    let discountPrice: Double?
    let isAvailable: Bool
    let showDescription: Bool
    let onAdd: () -> Void
    let onTap: () -> Void

    init(product: Product, tagType: ProductTagType? = nil, isLast: Bool = false, discountPrice: Double? = nil, isAvailable: Bool = true, showDescription: Bool = true, onAdd: @escaping () -> Void, onTap: @escaping () -> Void) {
        self.product = product
        self.tagType = tagType
        self.isLast = isLast
        self.discountPrice = discountPrice
        self.isAvailable = isAvailable
        self.showDescription = showDescription
        self.onAdd = onAdd
        self.onTap = onTap
    }

    var body: some View {
        VStack(spacing: 0) {
            Button(action: onTap) {
                HStack(alignment: .top, spacing: 10) {
                    // Text info (left)
                    VStack(alignment: .leading, spacing: 3) {
                        Text(product.name)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.black)
                            .lineLimit(1)
                            .truncationMode(.tail)

                        if showDescription, let desc = product.description, !desc.isEmpty {
                            let hasTag = !isAvailable || tagType != nil
                            Text(desc)
                                .font(.system(size: 14, weight: .regular))
                                .foregroundColor(Color(hex: "878787"))
                                .lineLimit(hasTag ? 1 : 2)
                                .truncationMode(.tail)
                                .multilineTextAlignment(.leading)
                                .padding(.top, 2)
                        }

                        PriceKcalRow(price: product.price, fontSize: 16, discountPrice: discountPrice)
                            .padding(.top, 4)

                        if !isAvailable {
                            Text("Unavailable")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color(hex: "EBEBEB"))
                                .cornerRadius(4)
                                .padding(.top, 3)
                        } else if let tag = tagType {
                            ProductTag(type: tag)
                                .padding(.top, 3)
                        }
                    }

                    Spacer(minLength: 0)

                    // Product image (right) with + button inside corner
                    ZStack(alignment: .bottomTrailing) {
                        CachedAsyncImage(url: product.resolvedImageUrl) {
                            LinearGradient(
                                colors: [Color(hex: "ECECEC"), Color(hex: "E2E2E2")],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                            .overlay(
                                Image(systemName: "takeoutbag.and.cup.and.straw")
                                    .font(.system(size: 22, weight: .light))
                                    .foregroundColor(Color(hex: "BFBFBF"))
                            )
                        }
                        .frame(width: 97, height: 97)
                        .clipShape(RoundedRectangle(cornerRadius: 6))

                        if isAvailable {
                            ProductAddButton(action: onAdd)
                                .offset(x: -4, y: -4)
                        }
                    }
                }
                .padding(.vertical, 10)
            }
            .buttonStyle(.plain)
            .allowsHitTesting(isAvailable)

            // Bottom divider
            if !isLast {
                Color(hex: "a6a6a6")
                    .frame(height: 1 / UIScreen.main.scale)
            }
        }
    }

    private func randomKcal(for product: Product) -> Int {
        // Generate consistent kcal based on product id hash
        let hash = abs(product.id.hashValue)
        return 80 + (hash % 200)
    }
}

// MARK: - Product Grid Card (image top, info bottom — flat, no shadow)
struct ProductGridCard: View {
    let product: Product
    let tagType: ProductTagType?
    let discountPrice: Double?
    let isAvailable: Bool
    let showDescription: Bool
    let onAdd: () -> Void
    let onTap: () -> Void

    init(product: Product, tagType: ProductTagType? = nil, discountPrice: Double? = nil, isAvailable: Bool = true, showDescription: Bool = true, onAdd: @escaping () -> Void, onTap: @escaping () -> Void) {
        self.product = product
        self.tagType = tagType
        self.discountPrice = discountPrice
        self.isAvailable = isAvailable
        self.showDescription = showDescription
        self.onAdd = onAdd
        self.onTap = onTap
    }

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 0) {
                // Product image (top) — true square via GeometryReader
                GeometryReader { geo in
                    ZStack {
                        CachedAsyncImage(url: product.resolvedImageUrl) {
                            LinearGradient(
                                colors: [Color(hex: "ECECEC"), Color(hex: "E2E2E2")],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                            .overlay(
                                Image(systemName: "takeoutbag.and.cup.and.straw")
                                    .font(.system(size: 26, weight: .light))
                                    .foregroundColor(Color(hex: "BFBFBF"))
                            )
                        }
                        .frame(width: geo.size.width, height: geo.size.width)

                        // Tag — top left inside image
                        if !isAvailable {
                            // Unavailable tag centered on image
                            Text("Unavailable")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color(hex: "EBEBEB").opacity(0.9))
                                .cornerRadius(6)
                        } else if let tag = tagType {
                            VStack {
                                HStack {
                                    ProductTag(type: tag)
                                        .padding(.leading, 8)
                                        .padding(.top, 8)
                                    Spacer()
                                }
                                Spacer()
                            }
                        }

                        // + button — bottom right inside image (hidden if unavailable)
                        if isAvailable {
                            VStack {
                                Spacer()
                                HStack {
                                    Spacer()
                                    ProductAddButton(action: onAdd)
                                        .padding(.trailing, 6)
                                        .padding(.bottom, 6)
                                }
                            }
                        }

                    }
                    .frame(width: geo.size.width, height: geo.size.width)
                }
                .aspectRatio(1, contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: 6))

                // Product info (bottom)
                let hasDesc = showDescription && product.description != nil && !product.description!.isEmpty
                VStack(alignment: .leading, spacing: 3) {
                    Text(product.name)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.black)
                        .lineLimit(1)
                        .truncationMode(.tail)

                    if hasDesc {
                        Text(product.description!)
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(Color(hex: "878787"))
                            .lineLimit(2)
                            .multilineTextAlignment(.leading)
                            .padding(.top, 2)
                    }

                    PriceKcalRow(price: product.price, fontSize: 15, discountPrice: discountPrice)
                        .padding(.top, hasDesc ? 0 : 2)

                    // Invisible spacer to keep card height consistent
                    if !hasDesc {
                        Text(" \n ")
                            .font(.system(size: 14))
                            .foregroundColor(.clear)
                            .lineLimit(2)
                    }
                }
                .padding(.horizontal, 8)
                .padding(.top, 6)
                .padding(.bottom, 8)
            }
            .background(Color.white)
            .cornerRadius(10)
        }
        .buttonStyle(.plain)
        .allowsHitTesting(isAvailable)
    }

    private func randomKcal(for product: Product) -> Int {
        let hash = abs(product.id.hashValue)
        return 80 + (hash % 200)
    }
}

// MARK: - Category Header (reports scroll position)
struct CategoryHeaderView: View {
    let name: String
    let catId: String
    var isFirst: Bool = false
    var isGridView: Bool = false
    let onPositionChange: (String, CGFloat) -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Thick section divider above category title (hidden for first category)
            if !isFirst {
                Rectangle()
                    .fill(Color(hex: "EBEBEB"))
                    .frame(height: 3)
                    .padding(.horizontal, -16)
                    .padding(.bottom, 12)
            }

            HStack {
                Text(name)
                    .font(.system(size: 19, weight: .bold))
                    .foregroundColor(.textPrimary)
                Spacer()
            }
        }
        .padding(.top, 2)
        .padding(.bottom, isGridView ? 16 : 10)
        .background(
            GeometryReader { geo in
                Color.clear
                    .onChange(of: geo.frame(in: .global).minY) { newY in
                        onPositionChange(catId, newY)
                    }
                    .onAppear {
                        onPositionChange(catId, geo.frame(in: .global).minY)
                    }
            }
        )
    }
}

// MARK: - Category Underline Tab (text + underline indicator)
struct CategoryUnderlineTab: View {
    let name: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 7) {
                Text(name)
                    .font(.system(size: 15, weight: isSelected ? .bold : .medium))
                    .foregroundColor(isSelected ? .black : Color(hex: "999999"))

                // Underline: black for selected, light gray for unselected (continuous bar)
                Rectangle()
                    .fill(isSelected ? Color.black : Color(hex: "f0f0f0"))
                    .frame(height: 4)
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Category Menu Sheet
struct CategoryMenuSheet: View {
    let categories: [Category]
    @Binding var selectedCategory: String?
    var onSelect: (String?) -> Void  // passes catId (nil = All)
    var onDismiss: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            // ── Drag handle ──
            Capsule()
                .fill(Color(hex: "DDDDDD"))
                .frame(width: 36, height: 4)
                .padding(.top, 10)
                .padding(.bottom, 6)

            // ── Header: "Menu" title ──
            Text("Menu")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.black)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)

            Divider()

            // ── Category list ──
            ScrollView {
                VStack(spacing: 0) {
                    // "All" option
                    categoryRow(name: "All", icon: "square.grid.2x2", isSelected: selectedCategory == nil) {
                        onSelect("__all__")
                    }

                    Divider().padding(.leading, 56)

                    // Each category
                    ForEach(Array(categories.enumerated()), id: \.element.id) { index, cat in
                        categoryRow(name: cat.name, icon: iconForCategory(cat.name), isSelected: selectedCategory == cat.id) {
                            onSelect(cat.id)
                        }

                        if index < categories.count - 1 {
                            Divider().padding(.leading, 56)
                        }
                    }
                }
            }

            // ── Dismiss button — flush to bottom ──
            Button { onDismiss() } label: {
                Text("Dismiss")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.black)
                    .cornerRadius(8)
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 34)
        }
        .background(Color.white)
    }

    private func categoryRow(name: String, icon: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(isSelected ? .black : Color(hex: "999999"))
                    .frame(width: 28, height: 28)

                Text(name)
                    .font(.system(size: 16, weight: isSelected ? .semibold : .regular))
                    .foregroundColor(isSelected ? .black : Color(hex: "333333"))

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.black)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .background(isSelected ? Color(hex: "F5F5F5") : Color.clear)
        }
        .buttonStyle(.plain)
    }

    private func iconForCategory(_ name: String) -> String {
        let lower = name.lowercased()
        if lower.contains("hot") || lower.contains("coffee") { return "cup.and.saucer.fill" }
        if lower.contains("iced") || lower.contains("cold") { return "snowflake" }
        if lower.contains("pastri") || lower.contains("bake") { return "birthday.cake.fill" }
        if lower.contains("dessert") || lower.contains("sweet") { return "fork.knife" }
        if lower.contains("snack") { return "leaf.fill" }
        if lower.contains("special") { return "star.fill" }
        if lower.contains("drink") || lower.contains("beverage") { return "wineglass.fill" }
        return "tag.fill"
    }
}

// MARK: - Filter Chip
struct HomeFilterChip: View {
    let label: String
    var icon: String? = nil
    var showChevron: Bool = false

    var body: some View {
        HStack(spacing: 4) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.system(size: 10))
                    .foregroundColor(Color(hex: "666666"))
            }
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(Color(hex: "333333"))
            if showChevron {
                Image(systemName: "chevron.down")
                    .font(.system(size: 8, weight: .semibold))
                    .foregroundColor(Color(hex: "999999"))
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(Color(hex: "F3F3F3"))
        .cornerRadius(18)
    }
}

// MARK: - Zero Corner Radius (for sheet edge-to-edge)
struct ZeroCornerRadius: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOS 16.4, *) {
            content.presentationCornerRadius(0)
        } else {
            content
        }
    }
}

// MARK: - Rounded Corner Shape
struct RoundedCornerShape: Shape {
    let corners: UIRectCorner
    let radius: CGFloat

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

extension Product: Hashable {
    static func == (lhs: Product, rhs: Product) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

// MARK: - Location Change Sheet (from Home header)
struct LocationChangeView: View {
    @ObservedObject var locationManager: LocationManager
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    @State private var isSaving = false
    @FocusState private var isFocused: Bool

    private let brandPink = Color(hex: "E91E63")
    private let brandGreen = Color(hex: "00B14F")

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Header
                HStack {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.textPrimary)
                    }
                    Spacer()
                    Text("Delivery Address")
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(.textPrimary)
                    Spacer()
                    // Balance the X button
                    Color.clear.frame(width: 24, height: 24)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)

                Divider()

                // Current location option
                Button {
                    useCurrentLocation()
                } label: {
                    HStack(spacing: 14) {
                        ZStack {
                            Circle()
                                .fill(brandGreen.opacity(0.12))
                                .frame(width: 42, height: 42)
                            Image(systemName: "location.fill")
                                .font(.system(size: 16))
                                .foregroundColor(brandGreen)
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Use my current location")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.textPrimary)
                            if locationManager.isGeocoding {
                                Text("Getting address...")
                                    .font(.system(size: 13))
                                    .foregroundColor(.textSecondary)
                            } else if !locationManager.address.isEmpty {
                                Text(locationManager.address)
                                    .font(.system(size: 13))
                                    .foregroundColor(.textSecondary)
                                    .lineLimit(1)
                            }
                        }
                        Spacer()
                        Image(systemName: "arrow.right")
                            .font(.system(size: 14))
                            .foregroundColor(.textTertiary)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 16)
                }

                Divider().padding(.leading, 76)

                // Search bar
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 16))
                        .foregroundColor(Color(hex: "999999"))
                    TextField("Search for an address", text: $searchText)
                        .font(.system(size: 15))
                        .focused($isFocused)
                        .onChange(of: searchText) { query in
                            locationManager.searchAddress(query)
                        }
                    if !searchText.isEmpty {
                        Button {
                            searchText = ""
                            locationManager.searchResults = []
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 16))
                                .foregroundColor(Color(hex: "CCCCCC"))
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color(hex: "F5F5F5"))
                .cornerRadius(12)
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 8)

                // Search results
                if searchText.isEmpty {
                    VStack(spacing: 20) {
                        Spacer().frame(height: 30)
                        Image(systemName: "map")
                            .font(.system(size: 40))
                            .foregroundColor(Color(hex: "DDDDDD"))
                        Text("Search for your delivery address")
                            .font(.system(size: 15))
                            .foregroundColor(.textSecondary)
                        Spacer()
                    }
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(Array(locationManager.searchResults.enumerated()), id: \.offset) { _, result in
                                Button {
                                    selectSearchResult(result)
                                } label: {
                                    HStack(spacing: 14) {
                                        Image(systemName: "mappin.circle")
                                            .font(.system(size: 20))
                                            .foregroundColor(Color(hex: "999999"))
                                            .frame(width: 28)

                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(result.title)
                                                .font(.system(size: 15, weight: .medium))
                                                .foregroundColor(.textPrimary)
                                                .lineLimit(1)
                                            if !result.subtitle.isEmpty {
                                                Text(result.subtitle)
                                                    .font(.system(size: 13))
                                                    .foregroundColor(.textSecondary)
                                                    .lineLimit(1)
                                            }
                                        }
                                        Spacer()
                                    }
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 14)
                                }
                                Divider().padding(.leading, 62)
                            }
                        }
                    }
                }
            }
            .navigationBarHidden(true)
        }
        .overlay {
            // Saving overlay
            if isSaving {
                Color.black.opacity(0.2).ignoresSafeArea()
                    .overlay(ProgressView().tint(.white).scaleEffect(1.5))
            }
        }
    }

    private func useCurrentLocation() {
        let status = locationManager.authorizationStatus
        if status == .authorizedWhenInUse || status == .authorizedAlways {
            locationManager.requestLocation()
            // Wait a moment for geocode, then save
            Task {
                isSaving = true
                // Wait for geocode to complete
                try? await Task.sleep(nanoseconds: 2_000_000_000)
                let customerId = authManager.currentUser?.id
                let _ = await locationManager.saveAddress(customerId: customerId)
                isSaving = false
                dismiss()
            }
        } else {
            locationManager.requestPermission()
            // Observe for auth change, then geocode
            Task {
                isSaving = true
                // Poll for permission + location
                for _ in 0..<60 {
                    try? await Task.sleep(nanoseconds: 500_000_000)
                    let s = locationManager.authorizationStatus
                    if s == .authorizedWhenInUse || s == .authorizedAlways {
                        locationManager.requestLocation()
                        try? await Task.sleep(nanoseconds: 2_000_000_000)
                        let customerId = authManager.currentUser?.id
                        let _ = await locationManager.saveAddress(customerId: customerId)
                        break
                    }
                    if s == .denied || s == .restricted { break }
                }
                isSaving = false
                dismiss()
            }
        }
    }

    private func selectSearchResult(_ result: MKLocalSearchCompletion) {
        Task {
            isSaving = true
            if let coord = await locationManager.geocodeSearchResult(result) {
                locationManager.userLocation = coord
                let customerId = authManager.currentUser?.id
                let _ = await locationManager.saveAddress(customerId: customerId)
            }
            isSaving = false
            dismiss()
        }
    }
}
