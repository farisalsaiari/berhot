import SwiftUI

extension Color {
    static let brand = Color(hex: "2993f0")
    static let brandDark = Color(hex: "1a6fc2")
    static let brandLight = Color(hex: "60b5ff")

    static let surfacePrimary = Color(UIColor.systemBackground)
    static let surfaceSecondary = Color(UIColor.secondarySystemBackground)
    static let surfaceTertiary = Color(UIColor.tertiarySystemBackground)

    static let textPrimary = Color(UIColor.label)
    static let textSecondary = Color(UIColor.secondaryLabel)
    static let textTertiary = Color(UIColor.tertiaryLabel)

    static let statusPending = Color.orange
    static let statusPreparing = Color.blue
    static let statusReady = Color.purple
    static let statusCompleted = Color.green
    static let statusCancelled = Color.red

    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }

    static func statusColor(for status: String) -> Color {
        switch status.lowercased() {
        case "pending": return .statusPending
        case "preparing": return .statusPreparing
        case "ready": return .statusReady
        case "completed": return .statusCompleted
        case "cancelled": return .statusCancelled
        default: return .gray
        }
    }
}
