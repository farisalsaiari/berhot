import SwiftUI

struct EditProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var viewModel = ProfileViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var firstName = ""
    @State private var lastName = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Avatar
                Circle()
                    .fill(Color.brand.opacity(0.15))
                    .frame(width: 80, height: 80)
                    .overlay {
                        Text(authManager.currentUser?.initials ?? "?")
                            .font(.title.bold())
                            .foregroundColor(.brand)
                    }
                    .padding(.top, 20)

                // Form
                VStack(spacing: 14) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(L.firstNameLabel)
                            .font(.subheadline.bold())
                            .foregroundColor(.textSecondary)

                        TextField(L.firstName, text: $firstName)
                            .textContentType(.givenName)
                            .padding(14)
                            .background(Color.surfaceSecondary)
                            .cornerRadius(12)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text(L.lastNameLabel)
                            .font(.subheadline.bold())
                            .foregroundColor(.textSecondary)

                        TextField(L.lastName, text: $lastName)
                            .textContentType(.familyName)
                            .padding(14)
                            .background(Color.surfaceSecondary)
                            .cornerRadius(12)
                    }
                }
                .padding(.horizontal)

                if let error = viewModel.error {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(.horizontal)
                }

                if let success = viewModel.successMessage {
                    Text(success)
                        .font(.caption)
                        .foregroundColor(.green)
                        .padding(.horizontal)
                }

                Spacer()

                Button {
                    Task {
                        await viewModel.updateProfile(firstName: firstName, lastName: lastName)
                    }
                } label: {
                    HStack {
                        if viewModel.isSaving {
                            ProgressView().tint(.white)
                        }
                        Text(L.saveChanges)
                            .font(.body.bold())
                    }
                    .frame(maxWidth: .infinity)
                    .padding(16)
                    .background(Color.brand)
                    .foregroundColor(.white)
                    .cornerRadius(14)
                }
                .disabled(viewModel.isSaving)
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
            .navigationTitle(L.editProfile)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(L.cancel) { dismiss() }
                }
            }
            .onAppear {
                firstName = authManager.currentUser?.firstName ?? ""
                lastName = authManager.currentUser?.lastName ?? ""
            }
        }
    }
}
