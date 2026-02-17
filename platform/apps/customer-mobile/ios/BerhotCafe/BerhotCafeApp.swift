import SwiftUI

@main
struct BerhotCafeApp: App {
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var cartManager = CartManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(cartManager)
                .preferredColorScheme(nil)
        }
    }
}
