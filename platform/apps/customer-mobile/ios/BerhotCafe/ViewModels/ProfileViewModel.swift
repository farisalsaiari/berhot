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
