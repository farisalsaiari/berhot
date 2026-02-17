import SwiftUI

struct PhoneInputView: View {
    @StateObject private var viewModel = AuthViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.surfacePrimary.ignoresSafeArea()

                VStack(spacing: 0) {
                    Spacer()

                    // Logo
                    VStack(spacing: 12) {
                        Image(systemName: "cup.and.saucer.fill")
                            .font(.system(size: 50))
                            .foregroundColor(.brand)

                        Text("Berhot Cafe")
                            .font(.title.bold())
                            .foregroundColor(.textPrimary)

                        Text("Sign in to order and track your food")
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)
                    }
                    .padding(.bottom, 40)

                    // Step content
                    Group {
                        switch viewModel.step {
                        case .phone:
                            phoneStep
                        case .otp:
                            OTPVerifyView(viewModel: viewModel)
                        case .register:
                            RegisterView(viewModel: viewModel)
                        }
                    }
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .move(edge: .leading).combined(with: .opacity)
                    ))

                    Spacer()
                    Spacer()
                }
                .padding(.horizontal, 24)
            }
        }
    }

    private var phoneStep: some View {
        VStack(spacing: 16) {
            // Phone input
            HStack(spacing: 8) {
                Text(AppConfig.defaultCountryCode)
                    .font(.body.bold())
                    .foregroundColor(.textPrimary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 14)
                    .background(Color.surfaceSecondary)
                    .cornerRadius(12)

                TextField("5XX XXX XXX", text: $viewModel.phone)
                    .font(.body)
                    .keyboardType(.phonePad)
                    .padding(14)
                    .background(Color.surfaceSecondary)
                    .cornerRadius(12)
            }

            // Error
            if let error = viewModel.error {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Continue button
            Button {
                Task { await viewModel.sendOTP() }
            } label: {
                HStack {
                    if viewModel.isLoading {
                        ProgressView()
                            .tint(.white)
                    }
                    Text("Continue")
                        .font(.body.bold())
                }
                .frame(maxWidth: .infinity)
                .padding(16)
                .background(viewModel.phone.isEmpty ? Color.gray.opacity(0.3) : Color.brand)
                .foregroundColor(.white)
                .cornerRadius(14)
            }
            .disabled(viewModel.phone.isEmpty || viewModel.isLoading)
        }
    }
}
