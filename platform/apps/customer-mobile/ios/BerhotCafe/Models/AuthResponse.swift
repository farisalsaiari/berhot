import Foundation

struct OTPSendResponse: Codable {
    let message: String
}

struct OTPVerifyResponse: Codable {
    let needsRegistration: Bool?
    let accessToken: String?
    let refreshToken: String?
    let user: User?
    let tenantId: String?
}

struct RegisterResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let user: User
    let tenantId: String?
}

struct RefreshResponse: Codable {
    let accessToken: String
    let refreshToken: String?
}
