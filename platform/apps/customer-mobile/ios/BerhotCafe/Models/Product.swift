import Foundation

struct Product: Codable, Identifiable {
    let id: String
    let tenantId: String?
    let categoryId: String?
    let categoryName: String?
    let name: String
    let sku: String?
    let description: String?
    let price: Double
    let cost: Double?
    let imageUrl: String?
    let isActive: Bool?
    let sortOrder: Int?
    let hasRequiredModifiers: Bool?
    let createdAt: String?
    let updatedAt: String?
    let category: Category?

    // Bilingual fields (industry standard: separate EN/AR columns)
    let nameEn: String?
    let nameAr: String?
    let descriptionEn: String?
    let descriptionAr: String?
    let categoryNameEn: String?
    let categoryNameAr: String?

    var isAvailable: Bool { isActive ?? true }

    var needsModifierSelection: Bool {
        hasRequiredModifiers ?? false
    }

    /// Returns the localized product name based on user's language preference.
    /// Falls back to the default `name` if the localized value is not set.
    var localizedName: String {
        if LanguageManager.shared.currentLanguage == .arabic {
            return (nameAr?.isEmpty == false) ? nameAr! : name
        }
        return (nameEn?.isEmpty == false) ? nameEn! : name
    }

    /// Returns the localized description based on user's language preference.
    var localizedDescription: String? {
        if LanguageManager.shared.currentLanguage == .arabic {
            return (descriptionAr?.isEmpty == false) ? descriptionAr : description
        }
        return (descriptionEn?.isEmpty == false) ? descriptionEn : description
    }

    /// Returns the localized category name based on user's language preference.
    var localizedCategoryName: String? {
        if LanguageManager.shared.currentLanguage == .arabic {
            return (categoryNameAr?.isEmpty == false) ? categoryNameAr : categoryName
        }
        return (categoryNameEn?.isEmpty == false) ? categoryNameEn : categoryName
    }

    /// Resolves relative image paths (e.g. "/uploads/xxx.png") to full URLs using POS base
    var resolvedImageUrl: URL? {
        guard let raw = imageUrl, !raw.isEmpty else { return nil }
        if raw.hasPrefix("http") {
            return URL(string: raw)
        }
        // Relative path — prepend POS base URL
        return URL(string: AppConfig.posBaseURL + raw)
    }
}

struct ProductsResponse: Codable {
    let products: [Product]
    let total: Int?
}
