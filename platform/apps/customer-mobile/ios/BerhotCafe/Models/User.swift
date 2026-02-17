import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String?
    let phone: String?
    let firstName: String
    let lastName: String
    let role: String
    let status: String
    let tenantId: String?

    var fullName: String {
        "\(firstName) \(lastName)".trimmingCharacters(in: .whitespaces)
    }

    var initials: String {
        let f = firstName.prefix(1).uppercased()
        let l = lastName.prefix(1).uppercased()
        return "\(f)\(l)"
    }
}
