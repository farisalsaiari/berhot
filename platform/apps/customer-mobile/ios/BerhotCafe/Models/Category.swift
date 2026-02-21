import Foundation

struct Category: Codable, Identifiable {
    let id: String
    let tenantId: String?
    let name: String
    let description: String?
    let sortOrder: Int?
    let createdAt: String?
    let updatedAt: String?

    // Bilingual fields
    let nameEn: String?
    let nameAr: String?

    /// Returns the localized category name based on user's language preference.
    var localizedName: String {
        if LanguageManager.shared.currentLanguage == .arabic {
            return (nameAr?.isEmpty == false) ? nameAr! : name
        }
        return (nameEn?.isEmpty == false) ? nameEn! : name
    }
}

struct CategoriesResponse: Codable {
    let categories: [Category]
}
