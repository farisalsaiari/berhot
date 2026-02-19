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
                                        .padding(.bottom, 12)
                                }

                                // ── Sticky Category Tabs ──
                                LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
                                    Section {
                                        // ── Products grouped by category with titles ──
                                        productsSectionWithAnchors
                                            .padding(.horizontal, 16)
                                            .padding(.bottom, 100)
                                    } header: {
                                        VStack(spacing: 0) {
                                            categoryTabs(scrollProxy: scrollProxy)
                                                .padding(.vertical, 9)
                                            if isCategoryPinned {
                                                Divider()
                                            }
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
                    floatingCartButton
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
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundColor(.black.opacity(0.4))
                            }
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
                    .padding(.vertical, 11)
                    .background(Color(hex: "F3F3F3"))
                    .cornerRadius(12)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 14)

                Divider()
                    .padding(.horizontal, 20)
            }
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
                        .font(.system(size: 12, weight: deliveryMode == index ? .bold : .medium))
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

    // MARK: - Category Tabs (underline style) + Filter Chips
    private func categoryTabs(scrollProxy: ScrollViewProxy) -> some View {
        VStack(spacing: 10) {
            // ── Row 1: Category names with underline indicator ──
            ScrollViewReader { tabProxy in
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 20) {
                        // Menu icon — opens all categories sheet
                        Button { withAnimation(.easeOut(duration: 0.25)) { showCategoryMenu = true } } label: {
                            Image(systemName: "line.3.horizontal")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.black)
                        }
                        .padding(.trailing, 4)

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
                    .padding(.horizontal, 16)
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

            // ── Row 2: Filter chips (sorting, filtering) ──
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    HomeFilterChip(label: "Offers", icon: "tag.fill")
                    HomeFilterChip(label: "Delivery fee", icon: nil, showChevron: true)
                    HomeFilterChip(label: "Under 30 min", icon: nil)
                    HomeFilterChip(label: "Highest rated", icon: "star.fill")
                }
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Products Section (with category titles + scroll-detection)
    private var productsSectionWithAnchors: some View {
        VStack(spacing: 12) {
            Color.clear.frame(height: 0).id("products_top")

            ForEach(sortedCategoryKeys, id: \.self) { categoryName in
                if let items = groupedProducts[categoryName] {
                    let catId = categoryIdFor(name: categoryName)

                    // Invisible scroll target for tap-to-scroll
                    Color.clear.frame(height: 0).id("scroll_\(catId)")

                    // Category title with position tracking + scroll anchor
                    CategoryHeaderView(
                        name: categoryName,
                        catId: catId,
                        onPositionChange: { id, minY in
                            guard !isTapScrolling else { return }
                            categoryPositionChanged(id: id, minY: minY)
                        }
                    )
                    .id("cat_\(catId)")

                    ForEach(items) { product in
                        ProductRowView(product: product) {
                            if product.needsModifierSelection {
                                selectedProduct = product
                            } else {
                                cartManager.addItem(product: product)
                                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            }
                        } onTap: {
                            selectedProduct = product
                        }
                    }
                }
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

    // MARK: - Floating Cart
    private var floatingCartButton: some View {
        Button {
            showCart = true
        } label: {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "cart.fill").font(.system(size: 16))
                    Text("\(cartManager.itemCount) items")
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
        .padding(.top, 12)
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

// MARK: - Product Row (DoorDash style)
struct ProductRowView: View {
    let product: Product
    let onAdd: () -> Void
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.textPrimary)
                        .lineLimit(1)

                    if let desc = product.description, !desc.isEmpty {
                        Text(desc)
                            .font(.system(size: 13))
                            .foregroundColor(.textSecondary)
                            .lineLimit(2)
                    }

                    Text("SAR \(String(format: "%.0f", product.price))")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.textPrimary)
                        .padding(.top, 2)
                }
                Spacer()

                ZStack(alignment: .bottomTrailing) {
                    CachedAsyncImage(url: URL(string: product.imageUrl ?? "")) {
                        RoundedRectangle(cornerRadius: 12).fill(Color(hex: "F5F5F5"))
                            .overlay(Image(systemName: "cup.and.saucer").font(.title3).foregroundColor(.textTertiary))
                    }
                    .frame(width: 100, height: 100)
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    Button { onAdd() } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.black)
                            .frame(width: 28, height: 28)
                            .background(Color(hex: "FFD300"))
                            .clipShape(Circle())
                            .shadow(color: .black.opacity(0.15), radius: 3, y: 1)
                    }
                    .offset(x: 4, y: 4)
                }
            }
            .padding(12)
            .background(Color.surfacePrimary)
            .cornerRadius(14)
            .shadow(color: .black.opacity(0.04), radius: 6, y: 2)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Category Header (reports scroll position)
struct CategoryHeaderView: View {
    let name: String
    let catId: String
    let onPositionChange: (String, CGFloat) -> Void

    var body: some View {
        HStack {
            Text(name)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.textPrimary)
            Spacer()
        }
        .padding(.top, 16)
        .padding(.bottom, 4)
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
            VStack(spacing: 6) {
                Text(name)
                    .font(.system(size: 14, weight: isSelected ? .bold : .regular))
                    .foregroundColor(isSelected ? .black : Color(hex: "999999"))

                // Underline indicator
                Rectangle()
                    .fill(isSelected ? Color.black : Color.clear)
                    .frame(height: 2.5)
                    .cornerRadius(1.25)
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
