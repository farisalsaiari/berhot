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
