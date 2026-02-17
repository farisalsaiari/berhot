import SwiftUI

enum SplashPhase {
    case brand      // Full-screen brand splash (like Zomato)
    case spinner    // Logo + spinner loading
    case ready      // App is ready, show auth or main
}

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var splashPhase: SplashPhase = .brand
    @State private var locationComplete = false

    private var needsLocation: Bool {
        // Show location flow if user is authenticated but hasn't saved an address
        authManager.isAuthenticated && !locationComplete &&
            UserDefaults.standard.string(forKey: "berhot_saved_address") == nil
    }

    var body: some View {
        ZStack {
            switch splashPhase {
            case .brand:
                BrandSplashView()
                    .transition(.opacity)

            case .spinner:
                SpinnerSplashView()
                    .transition(.opacity)

            case .ready:
                if authManager.isAuthenticated {
                    if needsLocation {
                        LocationFlowView(isComplete: $locationComplete)
                            .transition(.opacity)
                    } else {
                        MainTabView()
                            .transition(.opacity)
                    }
                } else {
                    PhoneInputView()
                        .transition(.opacity)
                }
            }
        }
        .animation(.easeInOut(duration: 0.4), value: splashPhase == .brand)
        .animation(.easeInOut(duration: 0.4), value: splashPhase == .spinner)
        .animation(.easeInOut(duration: 0.3), value: authManager.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: locationComplete)
        .onAppear {
            startSplashSequence()
        }
    }

    private func startSplashSequence() {
        // Phase 1: Brand splash for 1.5s
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            withAnimation {
                splashPhase = .spinner
            }

            // Phase 2: Spinner for 1.5s (or until auth check completes)
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation {
                    splashPhase = .ready
                }
            }
        }
    }
}

// MARK: - Phase 1: Brand Splash (Zomato-style)
struct BrandSplashView: View {
    @State private var logoScale: CGFloat = 0.8
    @State private var logoOpacity: Double = 0

    var body: some View {
        ZStack {
            // Full-screen brand color background
            Color(hex: "2563eb")
                .ignoresSafeArea()

            VStack(spacing: 20) {
                // Berhot logo shape — white on blue
                BerhotLogoShape()
                    .fill(Color.white)
                    .frame(width: 120, height: 120)

                // Brand name
                Text("berhot")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .tracking(-1)

                // Divider line
                Rectangle()
                    .fill(Color.white.opacity(0.3))
                    .frame(width: 180, height: 1.5)
                    .padding(.top, 4)

                // Tagline
                Text("A BERHOT PLATFORM")
                    .font(.system(size: 14, weight: .semibold, design: .default))
                    .foregroundColor(.white.opacity(0.7))
                    .tracking(3)
            }
            .scaleEffect(logoScale)
            .opacity(logoOpacity)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                logoScale = 1.0
                logoOpacity = 1.0
            }
        }
    }
}

// MARK: - Phase 2: Spinner Splash
struct SpinnerSplashView: View {
    @State private var isSpinning = false

    var body: some View {
        ZStack {
            // Same brand background
            Color(hex: "2563eb")
                .ignoresSafeArea()

            VStack(spacing: 30) {
                // Smaller logo
                BerhotLogoShape()
                    .fill(Color.white)
                    .frame(width: 70, height: 70)

                Text("berhot")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .tracking(-0.5)

                // Spinner
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.3)
                    .padding(.top, 10)
            }
        }
    }
}
