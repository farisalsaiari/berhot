import Foundation

enum AuthService {
    static func sendOTP(phone: String) async throws -> OTPSendResponse {
        let body = ["identifier": phone]
        return try await APIClient.shared.identityRequest("POST", path: "/api/v1/auth/otp/send", body: body)
    }

    static func verifyOTP(phone: String, code: String) async throws -> OTPVerifyResponse {
        let body = ["identifier": phone, "code": code]
        return try await APIClient.shared.identityRequest("POST", path: "/api/v1/auth/otp/verify", body: body)
    }

    static func register(phone: String, firstName: String, lastName: String) async throws -> RegisterResponse {
        let body = ["identifier": phone, "firstName": firstName, "lastName": lastName]
        return try await APIClient.shared.identityRequest("POST", path: "/api/v1/auth/register", body: body)
    }
}
