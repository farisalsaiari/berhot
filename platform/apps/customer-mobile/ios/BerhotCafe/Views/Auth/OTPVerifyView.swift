import SwiftUI

struct OTPVerifyView: View {
    @ObservedObject var viewModel: AuthViewModel
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 20) {
            VStack(spacing: 8) {
                Text(L.verifyYourNumber)
                    .font(.title3.bold())
                    .foregroundColor(.textPrimary)

                Text(L.enterOTPCode(length: AppConfig.otpLength, countryCode: AppConfig.defaultCountryCode, phone: viewModel.phone))
                    .font(.subheadline)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }

            // OTP input boxes
            HStack(spacing: 10) {
                ForEach(0..<AppConfig.otpLength, id: \.self) { index in
                    let char = index < viewModel.otpCode.count
                        ? String(viewModel.otpCode[viewModel.otpCode.index(viewModel.otpCode.startIndex, offsetBy: index)])
                        : ""

                    Text(char)
                        .font(.title2.bold())
                        .frame(width: 48, height: 56)
                        .background(Color.surfaceSecondary)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(index == viewModel.otpCode.count ? Color.brand : Color.clear, lineWidth: 2)
                        )
                }
            }
            .onTapGesture { isFocused = true }
            .overlay {
                TextField("", text: $viewModel.otpCode)
                    .keyboardType(.numberPad)
                    .focused($isFocused)
                    .opacity(0.01)
                    .onChange(of: viewModel.otpCode) { newValue in
                        if newValue.count > AppConfig.otpLength {
                            viewModel.otpCode = String(newValue.prefix(AppConfig.otpLength))
                        }
                        if newValue.count == AppConfig.otpLength {
                            Task { await viewModel.verifyOTP() }
                        }
                    }
            }

            if let error = viewModel.error {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            }

            Button {
                Task { await viewModel.verifyOTP() }
            } label: {
                HStack {
                    if viewModel.isLoading {
                        ProgressView().tint(.white)
                    }
                    Text(L.verify)
                        .font(.body.bold())
                }
                .frame(maxWidth: .infinity)
                .padding(16)
                .background(viewModel.otpCode.count == AppConfig.otpLength ? Color.brand : Color.gray.opacity(0.3))
                .foregroundColor(.white)
                .cornerRadius(14)
            }
            .disabled(viewModel.otpCode.count != AppConfig.otpLength || viewModel.isLoading)

            Button {
                viewModel.goBack()
            } label: {
                Text(L.changePhoneNumber)
                    .font(.subheadline)
                    .foregroundColor(.brand)
            }
        }
        .onAppear { isFocused = true }
    }
}
