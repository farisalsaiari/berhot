import Foundation

struct ModifierGroup: Codable, Identifiable {
    let id: String
    let name: String
    let displayName: String?
    let selectionType: String // "single" or "multiple"
    let minSelections: Int?
    let maxSelections: Int?
    let isRequired: Bool
    let sortOrder: Int?
    let items: [ModifierItem]

    // Bilingual fields
    let nameEn: String?
    let nameAr: String?
    let displayNameEn: String?
    let displayNameAr: String?

    var isSingleSelect: Bool { selectionType == "single" }

    /// Returns localized display name for the modifier group header.
    var localizedName: String {
        if LanguageManager.shared.currentLanguage == .arabic {
            return (nameAr?.isEmpty == false) ? nameAr! : name
        }
        return (nameEn?.isEmpty == false) ? nameEn! : name
    }

    var localizedDisplayName: String {
        if LanguageManager.shared.currentLanguage == .arabic {
            return (displayNameAr?.isEmpty == false) ? displayNameAr! : (displayName ?? name)
        }
        return (displayNameEn?.isEmpty == false) ? displayNameEn! : (displayName ?? name)
    }

    var headerText: String {
        localizedDisplayName
    }

    var requirementText: String? {
        if isRequired { return L.required }
        return nil
    }
}

struct ModifierItem: Codable, Identifiable {
    let id: String
    let name: String
    let priceAdjustment: Double
    let isDefault: Bool
    let sortOrder: Int?

    // Bilingual fields
    let nameEn: String?
    let nameAr: String?

    /// Returns the localized modifier item name.
    var localizedName: String {
        if LanguageManager.shared.currentLanguage == .arabic {
            return (nameAr?.isEmpty == false) ? nameAr! : name
        }
        return (nameEn?.isEmpty == false) ? nameEn! : name
    }

    var priceText: String? {
        if priceAdjustment == 0 { return nil }
        let sign = priceAdjustment > 0 ? "+" : ""
        return "\(sign)SAR \(String(format: "%.0f", priceAdjustment))"
    }
}

struct ModifierGroupsResponse: Codable {
    let modifierGroups: [ModifierGroup]
}

struct ProductModifiersResponse: Codable {
    let modifierGroups: [ModifierGroup]
}

// Selection tracking
struct SelectedModifier: Codable, Hashable {
    let groupId: String
    let groupName: String
    let itemId: String
    let itemName: String
    let priceAdjustment: Double
}
