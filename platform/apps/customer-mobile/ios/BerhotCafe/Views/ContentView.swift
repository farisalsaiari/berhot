import SwiftUI
import AppTrackingTransparency
import UserNotifications

// MARK: - App Flow Phases
enum AppPhase: Equatable {
    case splash           // Brand + spinner (single persistent view)
    case permissions      // ATT → Notifications → Location (system dialogs)
    case intro            // Onboarding (first launch only)
    case ready            // Auth or Main app
}

enum PermissionStep: Equatable {
    case tracking
    case notifications
    case location
    case done
}

struct ContentView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var phase: AppPhase = .splash
    @State private var showSpinner = false
    @State private var permissionStep: PermissionStep = .tracking
    @State private var locationComplete = false

    @AppStorage("hasSeenOnboarding") private var hasSeenOnboarding = false
    @ObservedObject private var locManager = LocationManager.shared

    private var needsLocation: Bool {
        authManager.isAuthenticated && !locationComplete &&
            UserDefaults.standard.string(forKey: "berhot_saved_address") == nil &&
            locManager.address.isEmpty
    }

    var body: some View {
        ZStack {
            switch phase {
            case .splash, .permissions:
                SplashView(showSpinner: showSpinner)

            case .intro:
                IntroView {
                    hasSeenOnboarding = true
                    withAnimation(.easeInOut(duration: 0.4)) {
                        phase = .ready
                    }
                }
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
        .animation(.easeInOut(duration: 0.4), value: phase)
        .animation(.easeInOut(duration: 0.3), value: authManager.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: locationComplete)
        .onAppear {
            startSplashSequence()
        }
        .onChange(of: phase) { newPhase in
            if newPhase == .permissions {
                startPermissionFlow()
            }
        }
    }

    // MARK: - Splash Sequence

    private func startSplashSequence() {
        // Show brand text for 1.5s, then swap to spinner
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            withAnimation(.easeInOut(duration: 0.3)) {
                showSpinner = true
            }

            // Spinner for 1.5s, then move to permissions
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                phase = .permissions
            }
        }
    }

    // MARK: - Permission Flow (sequential system dialogs)

    private func startPermissionFlow() {
        permissionStep = .tracking
        requestTracking()
    }

    private func requestTracking() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            ATTrackingManager.requestTrackingAuthorization { _ in
                DispatchQueue.main.async {
                    permissionStep = .notifications
                    requestNotifications()
                }
            }
        }
    }

    private func requestNotifications() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { _, _ in
            DispatchQueue.main.async {
                permissionStep = .location
                requestLocationPermission()
            }
        }
    }

    private func requestLocationPermission() {
        LocationManager.shared.requestPermission()
        observeLocationAuth()
    }

    private func observeLocationAuth() {
        let startTime = Date()
        Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { timer in
            let status = LocationManager.shared.authorizationStatus
            let elapsed = Date().timeIntervalSince(startTime)

            if status != .notDetermined || elapsed > 30 {
                timer.invalidate()
                DispatchQueue.main.async {
                    permissionStep = .done
                    moveToNextPhase()
                }
            }
        }
    }

    private func moveToNextPhase() {
        withAnimation(.easeInOut(duration: 0.4)) {
            if !hasSeenOnboarding {
                phase = .intro
            } else {
                phase = .ready
            }
        }
    }
}

// MARK: - Unified Splash View (no flash between states)
struct SplashView: View {
    var showSpinner: Bool
    @State private var logoScale: CGFloat = 0.8
    @State private var logoOpacity: Double = 0

    var body: some View {
        ZStack {
            // Persistent blue background — never re-renders
            Color(hex: "2563eb")
                .ignoresSafeArea()

            VStack(spacing: 14) {
                BerhotLogoShape()
                    .fill(Color.white)
                    .frame(width: 70, height: 70)

                // Cross-fade between text and spinner
                ZStack {
                    if !showSpinner {
                        Text("berhot")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundColor(.white.opacity(0.85))
                            .tracking(-0.3)
                            .transition(.opacity)
                    }

                    if showSpinner {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.1)
                            .transition(.opacity)
                    }
                }
                .frame(height: 24)
                .animation(.easeInOut(duration: 0.3), value: showSpinner)
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
