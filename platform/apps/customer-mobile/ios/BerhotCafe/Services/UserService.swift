import Foundation

enum UserService {
    static func fetchProfile() async throws -> User {
        return try await APIClient.shared.identityRequest("GET", path: "/api/v1/users/me", authenticated: true)
    }

    static func updateProfile(firstName: String?, lastName: String?, phone: String?) async throws -> MessageResponse {
        var body: [String: String] = [:]
        if let firstName = firstName { body["firstName"] = firstName }
        if let lastName = lastName { body["lastName"] = lastName }
        if let phone = phone { body["phone"] = phone }
        return try await APIClient.shared.identityRequest("PUT", path: "/api/v1/users/me", body: body, authenticated: true)
    }
}

struct MessageResponse: Codable {
    let message: String
}
