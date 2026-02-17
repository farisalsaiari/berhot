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

    var isSingleSelect: Bool { selectionType == "single" }

    var headerText: String {
        displayName ?? "Choose \(name)"
    }

    var requirementText: String? {
        if isRequired { return "Required" }
        return nil
    }
}

struct ModifierItem: Codable, Identifiable {
    let id: String
    let name: String
    let priceAdjustment: Double
    let isDefault: Bool
    let sortOrder: Int?

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
