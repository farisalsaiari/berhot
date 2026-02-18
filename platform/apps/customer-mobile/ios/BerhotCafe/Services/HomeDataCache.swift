import Foundation

/// In-memory cache for home screen data.
/// Persists across tab switches so skeleton only shows on first cold load.
class HomeDataCache {
    static let shared = HomeDataCache()
    private init() {}

    var store: Store?
    var products: [Product]?
    var categories: [Category]?
    var bannerSettings: BannerSettings?
    var banners: [HomeBanner]?

    /// Whether we have cached core data (store + products + categories)
    var hasCachedData: Bool {
        products != nil && categories != nil
    }

    /// Clear all cached data (e.g. on logout or pull-to-refresh)
    func clear() {
        store = nil
        products = nil
        categories = nil
        bannerSettings = nil
        banners = nil
    }
}
