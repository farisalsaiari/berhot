import Foundation

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var isLoading = false
    @Published var isSaving = false
    @Published var error: String?
    @Published var successMessage: String?

    func loadProfile() async {
        isLoading = true
        error = nil

        if AppConfig.demoMode {
            self.user = AuthManager.shared.currentUser
            isLoading = false
            return
        }

        do {
            self.user = try await UserService.fetchProfile()
            AuthManager.shared.updateUser(self.user!)
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func updateProfile(firstName: String, lastName: String) async {
        isSaving = true
        error = nil
        successMessage = nil

        if AppConfig.demoMode {
            // Update locally in demo mode
            if let current = AuthManager.shared.currentUser {
                let updated = User(
                    id: current.id,
                    email: current.email,
                    phone: current.phone,
                    firstName: firstName,
                    lastName: lastName,
                    role: current.role,
                    status: current.status,
                    tenantId: current.tenantId
                )
                AuthManager.shared.updateUser(updated)
                self.user = updated
                // Persist to UserDefaults
                if let data = try? JSONEncoder().encode(updated) {
                    UserDefaults.standard.set(data, forKey: "berhot_demo_user")
                }
                successMessage = "Profile updated"
            }
            isSaving = false
            return
        }

        do {
            _ = try await UserService.updateProfile(firstName: firstName, lastName: lastName, phone: nil)
            await loadProfile()
            successMessage = "Profile updated"
        } catch {
            self.error = error.localizedDescription
        }
        isSaving = false
    }
}
