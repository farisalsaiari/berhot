import Foundation
import SwiftUI

enum AuthStep {
    case phone
    case otp
    case register
}

@MainActor
class AuthViewModel: ObservableObject {
    @Published var step: AuthStep = .phone
    @Published var phone = ""
    @Published var otpCode = ""
    @Published var firstName = ""
    @Published var lastName = ""
    @Published var isLoading = false
    @Published var error: String?

    private var fullPhone: String {
        let cleaned = phone.replacingOccurrences(of: " ", with: "")
        if cleaned.hasPrefix("+") { return cleaned }
        return "\(AppConfig.defaultCountryCode)\(cleaned)"
    }

    func sendOTP() async {
        guard !phone.isEmpty else {
            error = "Please enter your phone number"
            return
        }
        isLoading = true
        error = nil

        if AppConfig.demoMode {
            // Demo mode: skip API call, go straight to OTP entry
            try? await Task.sleep(nanoseconds: 500_000_000) // simulate delay
            withAnimation { step = .otp }
            isLoading = false
            return
        }

        do {
            _ = try await AuthService.sendOTP(phone: fullPhone)
            withAnimation { step = .otp }
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func verifyOTP() async {
        guard otpCode.count == AppConfig.otpLength else {
            error = "Please enter the full \(AppConfig.otpLength)-digit code"
            return
        }
        isLoading = true
        error = nil

        if AppConfig.demoMode {
            // Demo mode: accept "1234" as valid OTP
            guard otpCode == AppConfig.demoOTPCode else {
                self.error = "Invalid code. Use \(AppConfig.demoOTPCode) for demo."
                isLoading = false
                return
            }

            // Check if customer already exists in POS engine (with timeout)
            let existing = await findExistingCustomer(phone: fullPhone, timeout: 3)

            if let existing = existing {
                // Returning user — sign in directly, skip registration
                let user = User(
                    id: existing.id,
                    email: nil,
                    phone: fullPhone,
                    firstName: existing.firstName,
                    lastName: existing.lastName,
                    role: "customer",
                    status: "active",
                    tenantId: AppConfig.demoTenantId
                )
                await AuthManager.shared.signIn(
                    accessToken: "demo-access-token",
                    refreshToken: "demo-refresh-token",
                    user: user,
                    tenantId: AppConfig.demoTenantId
                )
            } else {
                // New user — go to registration
                withAnimation { step = .register }
            }
            isLoading = false
            return
        }

        do {
            let result = try await AuthService.verifyOTP(phone: fullPhone, code: otpCode)

            if result.needsRegistration == true {
                withAnimation { step = .register }
            } else if let token = result.accessToken,
                      let refresh = result.refreshToken,
                      let user = result.user {
                await AuthManager.shared.signIn(
                    accessToken: token,
                    refreshToken: refresh,
                    user: user,
                    tenantId: result.tenantId
                )
            }
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func register() async {
        guard !firstName.isEmpty else {
            error = "Please enter your first name"
            return
        }
        isLoading = true
        error = nil

        if AppConfig.demoMode {
            // Demo mode: create a local dummy user and sign in
            let trimmedFirst = firstName.trimmingCharacters(in: .whitespaces)
            let trimmedLast = lastName.trimmingCharacters(in: .whitespaces)
            let userId = UUID().uuidString

            // Sign in immediately — don't wait for POS customer creation
            let demoUser = User(
                id: userId,
                email: nil,
                phone: fullPhone,
                firstName: trimmedFirst,
                lastName: trimmedLast,
                role: "customer",
                status: "active",
                tenantId: AppConfig.demoTenantId
            )
            await AuthManager.shared.signIn(
                accessToken: "demo-access-token",
                refreshToken: "demo-refresh-token",
                user: demoUser,
                tenantId: AppConfig.demoTenantId
            )
            isLoading = false

            // Create customer in POS engine in the background (non-blocking)
            let phone = fullPhone
            Task.detached {
                guard let url = URL(string: "\(AppConfig.posBaseURL)/api/v1/pos/customers") else { return }
                var req = URLRequest(url: url)
                req.httpMethod = "POST"
                req.timeoutInterval = 5
                req.setValue("application/json", forHTTPHeaderField: "Content-Type")
                req.setValue(AppConfig.demoTenantId, forHTTPHeaderField: "X-Tenant-ID")
                let body = ["firstName": trimmedFirst, "lastName": trimmedLast, "phone": phone]
                req.httpBody = try? JSONEncoder().encode(body)
                _ = try? await URLSession.shared.data(for: req)
            }
            return
        }

        do {
            let result = try await AuthService.register(
                phone: fullPhone,
                firstName: firstName.trimmingCharacters(in: .whitespaces),
                lastName: lastName.trimmingCharacters(in: .whitespaces)
            )
            await AuthManager.shared.signIn(
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user,
                tenantId: result.tenantId
            )
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    // Look up a customer by phone in the POS engine (with timeout)
    private func findExistingCustomer(phone: String, timeout: TimeInterval = 3) async -> DemoCustomer? {
        guard let url = URL(string: "\(AppConfig.posBaseURL)/api/v1/pos/customers") else { return nil }
        var req = URLRequest(url: url)
        req.timeoutInterval = timeout
        req.setValue(AppConfig.demoTenantId, forHTTPHeaderField: "X-Tenant-ID")
        guard let (data, _) = try? await URLSession.shared.data(for: req),
              let json = try? JSONDecoder().decode(DemoCustomersResponse.self, from: data) else { return nil }
        return json.customers.first(where: { $0.phone == phone })
    }

    func goBack() {
        withAnimation {
            switch step {
            case .otp:
                step = .phone
                otpCode = ""
            case .register:
                step = .otp
            case .phone:
                break
            }
        }
        error = nil
    }
}

// MARK: - Demo mode helpers
private struct DemoCustomer: Codable {
    let id: String
    let firstName: String
    let lastName: String
    let phone: String
}

private struct DemoCustomersResponse: Codable {
    let customers: [DemoCustomer]
}
