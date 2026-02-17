import Foundation

enum AppConfig {
    // MARK: - API URLs
    #if DEBUG
    static let identityBaseURL = "http://localhost:8080"
    static let posBaseURL = "http://localhost:8082"
    #else
    static let identityBaseURL = "https://api.berhot.com"
    static let posBaseURL = "https://pos.berhot.com"
    #endif

    // MARK: - Tenant
    static var tenantId: String {
        // Read from UserDefaults or use default
        UserDefaults.standard.string(forKey: "berhot_tenant_id") ?? ""
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
