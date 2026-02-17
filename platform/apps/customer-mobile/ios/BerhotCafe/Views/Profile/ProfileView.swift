import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var showEditProfile = false
    @State private var showLogoutConfirm = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Profile header
                VStack(spacing: 12) {
                    // Avatar
                    Circle()
                        .fill(Color.brand.opacity(0.15))
                        .frame(width: 80, height: 80)
                        .overlay {
                            Text(authManager.currentUser?.initials ?? "?")
                                .font(.title.bold())
                                .foregroundColor(.brand)
                        }

                    VStack(spacing: 4) {
                        Text(authManager.currentUser?.fullName ?? "User")
                            .font(.title3.bold())
                            .foregroundColor(.textPrimary)

                        if let phone = authManager.currentUser?.phone {
                            Text(phone)
                                .font(.subheadline)
                                .foregroundColor(.textSecondary)
                        }

                        if let email = authManager.currentUser?.email, !email.isEmpty {
                            Text(email)
                                .font(.subheadline)
                                .foregroundColor(.textSecondary)
                        }
                    }
                }
                .padding(.top, 10)

                // Menu items
                VStack(spacing: 2) {
                    ProfileMenuItem(icon: "person", title: "Edit Profile") {
                        showEditProfile = true
                    }

                    ProfileMenuItem(icon: "list.clipboard", title: "Order History") {
                        // Navigation handled by tab
                    }

                    ProfileMenuItem(icon: "bell", title: "Notifications") {
                        // Future
                    }

                    ProfileMenuItem(icon: "questionmark.circle", title: "Help & Support") {
                        // Future
                    }

                    ProfileMenuItem(icon: "info.circle", title: "About") {
                        // Future
                    }
                }
                .background(Color.surfaceSecondary)
                .cornerRadius(16)
                .padding(.horizontal)

                // Logout
                Button {
                    showLogoutConfirm = true
                } label: {
                    HStack {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                        Text("Sign Out")
                    }
                    .font(.body.weight(.medium))
                    .foregroundColor(.red)
                    .frame(maxWidth: .infinity)
                    .padding(16)
                    .background(Color.red.opacity(0.08))
                    .cornerRadius(14)
                }
                .padding(.horizontal)

                // Version
                Text("Berhot Cafe v1.0.0")
                    .font(.caption)
                    .foregroundColor(.textTertiary)
                    .padding(.top, 10)
            }
        }
        .navigationTitle("Profile")
        .sheet(isPresented: $showEditProfile) {
            EditProfileView()
        }
        .alert("Sign Out", isPresented: $showLogoutConfirm) {
            Button("Sign Out", role: .destructive) {
                authManager.signOut()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to sign out?")
        }
    }
}

struct ProfileMenuItem: View {
    let icon: String
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.body)
                    .foregroundColor(.brand)
                    .frame(width: 28)

                Text(title)
                    .font(.body)
                    .foregroundColor(.textPrimary)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.textTertiary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
    }
}
