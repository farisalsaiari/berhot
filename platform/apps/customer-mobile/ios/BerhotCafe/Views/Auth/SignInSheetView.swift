import SwiftUI

/// Binance-style sign-in modal sheet shown when unauthenticated users try to proceed to payment.
struct SignInSheetView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var viewModel = AuthViewModel()
    @State private var showFullAuth = false

    private let brandYellow = Color(hex: "FFD300")

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // ── Header: handle bar + close ──
                HStack {
                    Spacer()
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.textSecondary)
                            .frame(width: 32, height: 32)
                            .background(Color(hex: "F5F5F5"))
                            .clipShape(Circle())
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)

                // ── Welcome Title ──
                VStack(spacing: 8) {
                    Text("Welcome to Berhot")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundColor(.textPrimary)

                    Text("Sign in to complete your order")
                        .font(.system(size: 15))
                        .foregroundColor(.textSecondary)
                }
                .padding(.top, 12)
                .padding(.bottom, 28)

                // ── Phone Input Row ──
                VStack(alignment: .leading, spacing: 6) {
                    Text("Phone number")
                        .font(.system(size: 13))
                        .foregroundColor(.textSecondary)
                        .padding(.leading, 4)

                    HStack(spacing: 0) {
                        // Saudi flag + code
                        HStack(spacing: 8) {
                            Text("🇸🇦")
                                .font(.system(size: 24))
                            Text("+966")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.textPrimary)
                            Image(systemName: "chevron.down")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(.textTertiary)
                        }
                        .padding(.horizontal, 14)

                        // Divider line
                        Rectangle()
                            .fill(Color(hex: "E0E0E0"))
                            .frame(width: 1, height: 28)

                        // Phone input
                        TextField("5XX XXX XXXX", text: $viewModel.phone)
                            .font(.system(size: 16))
                            .keyboardType(.phonePad)
                            .padding(.horizontal, 14)
                    }
                    .padding(.vertical, 14)
                    .background(Color(hex: "F5F5F5"))
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color(hex: "E8E8E8"), lineWidth: 1)
                    )
                }
                .padding(.horizontal, 20)

                // Error
                if let error = viewModel.error {
                    Text(error)
                        .font(.system(size: 13))
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 24)
                        .padding(.top, 8)
                }

                // ── Continue Button ──
                Button {
                    Task {
                        await viewModel.sendOTP()
                        if viewModel.step == .otp {
                            showFullAuth = true
                        }
                    }
                } label: {
                    HStack {
                        if viewModel.isLoading {
                            ProgressView().tint(.black)
                        }
                        Text("Continue")
                            .font(.system(size: 16, weight: .bold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(viewModel.phone.isEmpty ? Color(hex: "E0E0E0") : brandYellow)
                    .foregroundColor(viewModel.phone.isEmpty ? Color(hex: "999999") : .black)
                    .cornerRadius(14)
                }
                .disabled(viewModel.phone.isEmpty || viewModel.isLoading)
                .padding(.horizontal, 20)
                .padding(.top, 20)

                // ── Divider with "or" ──
                HStack {
                    Rectangle().fill(Color(hex: "E8E8E8")).frame(height: 1)
                    Text("or")
                        .font(.system(size: 14))
                        .foregroundColor(.textTertiary)
                        .padding(.horizontal, 16)
                    Rectangle().fill(Color(hex: "E8E8E8")).frame(height: 1)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 20)

                // ── Social / Alternative Sign-in Options ──
                VStack(spacing: 10) {
                    socialButton(icon: "apple.logo", label: "Continue with Apple", systemIcon: true)
                    socialButton(icon: "g.circle.fill", label: "Continue with Google", systemIcon: true)
                    socialButton(icon: "envelope", label: "Continue with Email", systemIcon: true)

                    Button {
                        // Guest checkout: dismiss and proceed
                        dismiss()
                        // Post notification for guest checkout
                        NotificationCenter.default.post(name: .guestCheckoutRequested, object: nil)
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: "person")
                                .font(.system(size: 16))
                                .frame(width: 24)
                            Text("Continue as guest")
                                .font(.system(size: 15, weight: .medium))
                        }
                        .foregroundColor(.textPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color(hex: "F5F5F5"))
                        .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 20)

                Spacer()
            }
            .fullScreenCover(isPresented: $showFullAuth) {
                PhoneInputView()
            }
        }
        .onChange(of: authManager.isAuthenticated) { isAuth in
            if isAuth {
                dismiss()
            }
        }
    }

    // MARK: - Social Button
    private func socialButton(icon: String, label: String, systemIcon: Bool) -> some View {
        Button {
            // Future: implement social sign-in
        } label: {
            HStack(spacing: 10) {
                if systemIcon {
                    Image(systemName: icon)
                        .font(.system(size: 16))
                        .frame(width: 24)
                }
                Text(label)
                    .font(.system(size: 15, weight: .medium))
            }
            .foregroundColor(.textPrimary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color(hex: "F5F5F5"))
            .cornerRadius(12)
        }
    }
}

// MARK: - Notification for guest checkout
extension Notification.Name {
    static let guestCheckoutRequested = Notification.Name("guestCheckoutRequested")
}
