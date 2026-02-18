import SwiftUI
import MapKit

struct HomeView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var cartManager: CartManager
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
    @State private var bannerSettings: BannerSettings?
    @State private var banners: [HomeBanner] = []
    @State private var currentBannerIndex = 0
    @State private var bannerTimer: Timer?
    @State private var isTapScrolling = false   // true while programmatic scroll-to is in flight

    /// Live delivery address: prefer LocationManager's current address, fall back to saved
    private var displayAddress: String {
        if !locationManager.address.isEmpty {
            return locationManager.address
        }
        return UserDefaults.standard.string(forKey: "berhot_saved_address") ?? ""
    }

    private let brandYellow = Color(hex: "FFD300")

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
                            } else {
                                // ── Promo Banner / Slider ──
                                if bannerSettings?.bannerEnabled == true, !banners.isEmpty {
                                    bannerSection
                                        .padding(.bottom, 12)
                                }

                                // ── Sticky: Delivery Toggle + Category Tabs ──
                                // These pin to top when user scrolls past them
                                LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
                                    Section {
                                        // ── Products grouped by category with titles ──
                                        productsSectionWithAnchors
                                            .padding(.horizontal, 16)
                                            .padding(.bottom, 100)
                                    } header: {
                                        VStack(spacing: 0) {
                                            // Delivery / Pickup Toggle
                                            deliveryToggle
                                                .padding(.horizontal, 16)
                                                .padding(.bottom, 10)

                                            // Menu title
                                            HStack {
                                                Text("Menu")
                                                    .font(.system(size: 22, weight: .bold))
                                                    .foregroundColor(.textPrimary)
                                                Spacer()
                                            }
                                            .padding(.horizontal, 16)
                                            .padding(.bottom, 4)

                                            // Category Tabs
                                            categoryTabs(scrollProxy: scrollProxy)
                                                .padding(.bottom, 8)
                                        }
                                        .padding(.top, 12)
                                        .background(Color.white)
                                    }
                                }
                            }
                        }
                    }
                    .ignoresSafeArea(edges: .top)
                }

                // Floating Cart Button
                if !cartManager.isEmpty {
                    floatingCartButton
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showProfile) {
                NavigationStack { ProfileView() }
            }
            .sheet(item: $selectedProduct) { product in
                ProductDetailView(product: product)
            }
            .sheet(isPresented: $showLocationPicker) {
                LocationChangeView(locationManager: locationManager)
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

    // MARK: - Top Header (yellow card covers address + search)
    private var topHeaderSection: some View {
        VStack(spacing: 0) {
            // Yellow area: status bar + address + search + small gap
            VStack(spacing: 0) {
                // Address & logo bar
                HStack(alignment: .center) {
                    Button {
                        showLocationPicker = true
                    } label: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Deliver now")
                                .font(.system(size: 13))
                                .foregroundColor(.black.opacity(0.5))
                            HStack(spacing: 4) {
                                if locationManager.isGeocoding {
                                    Text("Getting location...")
                                        .font(.system(size: 16, weight: .bold))
                                        .foregroundColor(.black.opacity(0.6))
                                        .lineLimit(1)
                                } else {
                                    Text(displayAddress.isEmpty ? "Set delivery address" : displayAddress)
                                        .font(.system(size: 16, weight: .bold))
                                        .foregroundColor(.black)
                                        .lineLimit(1)
                                }
                                Image(systemName: "chevron.down")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundColor(.black)
                            }
                        }
                    }
                    Spacer()

                    Button { showProfile = true } label: {
                        BerhotLogoIcon(size: 24, color: .black)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 60)
                .padding(.bottom, 16)

                // Search bar (inside yellow area)
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.gray)
                    Text("Search Berhot Cafe")
                        .font(.system(size: 15))
                        .foregroundColor(Color(hex: "999999"))
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.white)
                .cornerRadius(14)
                .shadow(color: .black.opacity(0.06), radius: 6, y: 2)
                .padding(.horizontal, 20)
                .padding(.bottom, 16)
            }
            .background(brandYellow)
        }
    }

    // MARK: - Delivery Toggle
    private var deliveryToggle: some View {
        HStack(spacing: 0) {
            ForEach(["Delivery", "Pickup"].indices, id: \.self) { index in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) { deliveryMode = index }
                } label: {
                    Text(["Delivery", "Pickup"][index])
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(deliveryMode == index ? .black : .textSecondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(deliveryMode == index ? brandYellow : Color.clear)
                        .cornerRadius(10)
                }
            }
        }
        .padding(4)
        .background(Color(hex: "F0F0F0"))
        .cornerRadius(12)
    }

    // MARK: - Category Tabs (with scroll-to support)
    private func categoryTabs(scrollProxy: ScrollViewProxy) -> some View {
        ScrollViewReader { tabProxy in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    CategoryPill(name: "All", isSelected: selectedCategory == nil) {
                        isTapScrolling = true
                        withAnimation(.easeInOut(duration: 0.3)) {
                            selectedCategory = nil
                            scrollProxy.scrollTo("products_top", anchor: .top)
                        }
                        // Allow scroll-based auto-select again after animation
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { isTapScrolling = false }
                    }
                    .id("tab_all")

                    ForEach(categories) { cat in
                        CategoryPill(name: cat.name, isSelected: selectedCategory == cat.id) {
                            isTapScrolling = true
                            withAnimation(.easeInOut(duration: 0.3)) {
                                selectedCategory = cat.id
                                scrollProxy.scrollTo("cat_\(cat.id)", anchor: .top)
                            }
                            withAnimation(.easeInOut(duration: 0.2)) {
                                tabProxy.scrollTo("tab_\(cat.id)", anchor: .center)
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { isTapScrolling = false }
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
    }

    // MARK: - Products Section (with category titles + scroll-detection)
    private var productsSectionWithAnchors: some View {
        LazyVStack(spacing: 12) {
            let grouped = groupedProducts
            let sortedKeys = grouped.keys.sorted(by: { a, b in
                let aIdx = categories.firstIndex(where: { $0.name == a }) ?? 999
                let bIdx = categories.firstIndex(where: { $0.name == b }) ?? 999
                return aIdx < bIdx
            })

            Color.clear.frame(height: 0).id("products_top")

            ForEach(sortedKeys, id: \.self) { categoryName in
                if let items = grouped[categoryName] {
                    let catId = categoryIdFor(name: categoryName)

                    // Category title header with scroll-detection
                    HStack {
                        Text(categoryName)
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.textPrimary)
                        Spacer()
                    }
                    .padding(.top, 16)
                    .padding(.bottom, 4)
                    .id("cat_\(catId)")
                    .background(
                        GeometryReader { geo in
                            // Detect when this category header reaches near the top of the screen
                            Color.clear
                                .preference(
                                    key: CategoryOffsetPreferenceKey.self,
                                    value: [CategoryOffset(id: catId, minY: geo.frame(in: .global).minY)]
                                )
                        }
                    )

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
        .onPreferenceChange(CategoryOffsetPreferenceKey.self) { offsets in
            guard !isTapScrolling else { return }
            // Find the category whose header is closest to (but not far below) the top
            // We look for headers within a window near the top of the visible area
            let threshold: CGFloat = 200 // px from top of screen
            let visible = offsets.filter { $0.minY < threshold }.sorted { $0.minY > $1.minY }
            if let topCat = visible.first {
                if selectedCategory != topCat.id {
                    selectedCategory = topCat.id
                }
            } else if offsets.allSatisfy({ $0.minY > threshold }) {
                // All categories are below threshold → user is above first category
                if selectedCategory != nil {
                    selectedCategory = nil
                }
            }
        }
    }

    /// Map category name back to its ID for scroll anchoring
    private func categoryIdFor(name: String) -> String {
        categories.first(where: { $0.name == name })?.id ?? name
    }

    // MARK: - Floating Cart
    private var floatingCartButton: some View {
        NavigationLink {
            CartView()
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
        isLoading = true
        do {
            async let storeTask = StoreService.fetchStoreInfo()
            async let productsTask = ProductService.fetchProducts()
            async let categoriesTask = ProductService.fetchCategories()
            let (s, p, c) = try await (storeTask, productsTask, categoriesTask)
            store = s; products = p; categories = c
        } catch {
            print("HomeView load error: \(error)")
        }
        isLoading = false

        // Load banners (non-blocking)
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

// MARK: - Category Pill
struct CategoryPill: View {
    let name: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(name)
                .font(.system(size: 13, weight: isSelected ? .bold : .medium))
                .foregroundColor(isSelected ? .black : .textPrimary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color(hex: "FFD300") : Color(hex: "F0F0F0"))
                .cornerRadius(20)
        }
    }
}

// MARK: - Category Scroll Offset Detection
struct CategoryOffset: Equatable {
    let id: String
    let minY: CGFloat
}

struct CategoryOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: [CategoryOffset] = []
    static func reduce(value: inout [CategoryOffset], nextValue: () -> [CategoryOffset]) {
        value.append(contentsOf: nextValue())
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
