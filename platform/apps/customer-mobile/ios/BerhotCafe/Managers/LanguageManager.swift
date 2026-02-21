import SwiftUI

// MARK: - Language Manager
/// Manages app language (English / Arabic) with RTL support.
/// Uses @AppStorage for persistence across app launches.
class LanguageManager: ObservableObject {
    static let shared = LanguageManager()

    enum Language: String, CaseIterable {
        case english = "en"
        case arabic = "ar"

        var displayName: String {
            switch self {
            case .english: return "English"
            case .arabic: return "العربية"
            }
        }

        var layoutDirection: LayoutDirection {
            switch self {
            case .english: return .leftToRight
            case .arabic: return .rightToLeft
            }
        }

        var isRTL: Bool { self == .arabic }
    }

    @AppStorage("app_language") var currentLanguage: Language = .english {
        didSet { objectWillChange.send() }
    }

    var isArabic: Bool { currentLanguage == .arabic }
    var isEnglish: Bool { currentLanguage == .english }

    func toggle() {
        currentLanguage = currentLanguage == .english ? .arabic : .english
    }
}
