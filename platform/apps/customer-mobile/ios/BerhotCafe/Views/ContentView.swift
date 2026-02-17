import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        Group {
            if authManager.isLoading {
                // Splash screen
                ZStack {
                    Color.brand.ignoresSafeArea()
                    VStack(spacing: 16) {
                        Image(systemName: "cup.and.saucer.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.white)
                        Text("Berhot Cafe")
                            .font(.title.bold())
                            .foregroundColor(.white)
                    }
                }
            } else if authManager.isAuthenticated {
                MainTabView()
                    .transition(.opacity)
            } else {
                PhoneInputView()
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: authManager.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: authManager.isLoading)
    }
}
