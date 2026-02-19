import Foundation

enum AppConfig {
    // MARK: - API URLs
    // Simulator uses localhost, real device uses Mac's local IP
    private static let localIP = "192.168.100.7"

    /// true when running in iOS Simulator
    private static var isSimulator: Bool {
        #if targetEnvironment(simulator)
        return true
        #else
        return false
        #endif
    }

    private static var apiHost: String {
        isSimulator ? "localhost" : localIP
    }

    #if DEBUG
    static var identityBaseURL: String { "http://\(apiHost):8080" }
    static var posBaseURL: String { "http://\(apiHost):8082" }
    #else
    static let identityBaseURL = "https://api.berhot.com"
    static let posBaseURL = "https://pos.berhot.com"
    #endif

    // MARK: - Tenant
    static var tenantId: String {
        let saved = UserDefaults.standard.string(forKey: "berhot_tenant_id") ?? ""
        return saved.isEmpty ? demoTenantId : saved
    }

    static func setTenantId(_ id: String) {
        UserDefaults.standard.set(id, forKey: "berhot_tenant_id")
    }

    // MARK: - Demo Mode
    /// Set to true to bypass real API calls for auth (uses OTP "1234")
    static let demoMode = true
    static let demoOTPCode = "1234"
    static let demoTenantId = "4fcf6201-0e81-41a7-8b61-356d39def62a"

    // MARK: - Defaults
    static let defaultCountryCode = "+966"
    static let otpLength = 4
    static let orderPollingInterval: TimeInterval = 10
    static let animationDuration: Double = 0.3
}
