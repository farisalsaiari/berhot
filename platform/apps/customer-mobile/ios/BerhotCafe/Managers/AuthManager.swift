import Foundation
import SwiftUI

@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()

    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = true

    private init() {
        checkAuth()
    }

    func checkAuth() {
        isLoading = true
        if KeychainHelper.readString(forKey: "access_token") != nil {
            isAuthenticated = true
            // Load user profile in background
            Task {
                do {
                    let user = try await UserService.fetchProfile()
                    self.currentUser = user
                    if let tid = user.tenantId {
                        AppConfig.setTenantId(tid)
                    }
                } catch {
                    // Token might be invalid
                    print("Failed to load profile: \(error)")
                }
                self.isLoading = false
            }
        } else {
            isAuthenticated = false
            isLoading = false
        }
    }

    func signIn(accessToken: String, refreshToken: String, user: User, tenantId: String?) {
        KeychainHelper.save(accessToken, forKey: "access_token")
        KeychainHelper.save(refreshToken, forKey: "refresh_token")
        if let tid = tenantId ?? user.tenantId {
            AppConfig.setTenantId(tid)
        }
        self.currentUser = user
        withAnimation(.easeInOut(duration: 0.3)) {
            self.isAuthenticated = true
        }
    }

    func signOut() {
        KeychainHelper.delete(forKey: "access_token")
        KeychainHelper.delete(forKey: "refresh_token")
        UserDefaults.standard.removeObject(forKey: "berhot_tenant_id")
        self.currentUser = nil
        withAnimation(.easeInOut(duration: 0.3)) {
            self.isAuthenticated = false
        }
    }

    func updateUser(_ user: User) {
        self.currentUser = user
    }
}
