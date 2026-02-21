import SwiftUI
import UIKit

// MARK: - Lock app to portrait only
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
        return .portrait
    }
}

@main
struct BerhotCafeApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var cartManager = CartManager()
    @StateObject private var languageManager = LanguageManager.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(cartManager)
                .environmentObject(languageManager)
                .environment(\.layoutDirection, languageManager.currentLanguage.layoutDirection)
                .environment(\.locale, Locale(identifier: languageManager.currentLanguage.rawValue))
                .id(languageManager.currentLanguage.rawValue)
                .preferredColorScheme(nil)
        }
    }
}
