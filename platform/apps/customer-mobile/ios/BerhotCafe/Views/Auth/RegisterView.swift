import SwiftUI

struct RegisterView: View {
    @ObservedObject var viewModel: AuthViewModel

    var body: some View {
        VStack(spacing: 20) {
            VStack(spacing: 8) {
                Text(L.createYourAccount)
                    .font(.title3.bold())
                    .foregroundColor(.textPrimary)

                Text(L.enterNameToComplete)
                    .font(.subheadline)
                    .foregroundColor(.textSecondary)
            }

            VStack(spacing: 12) {
                TextField(L.firstName, text: $viewModel.firstName)
                    .font(.body)
                    .padding(14)
                    .background(Color.surfaceSecondary)
                    .cornerRadius(12)
                    .textContentType(.givenName)

                TextField(L.lastName, text: $viewModel.lastName)
                    .font(.body)
                    .padding(14)
                    .background(Color.surfaceSecondary)
                    .cornerRadius(12)
                    .textContentType(.familyName)
            }

            if let error = viewModel.error {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            Button {
                Task { await viewModel.register() }
            } label: {
                HStack {
                    if viewModel.isLoading {
                        ProgressView().tint(.white)
                    }
                    Text(L.createAccount)
                        .font(.body.bold())
                }
                .frame(maxWidth: .infinity)
                .padding(16)
                .background(viewModel.firstName.isEmpty ? Color.gray.opacity(0.3) : Color.brand)
                .foregroundColor(.white)
                .cornerRadius(14)
            }
            .disabled(viewModel.firstName.isEmpty || viewModel.isLoading)

            Button {
                viewModel.goBack()
            } label: {
                Text(L.back)
                    .font(.subheadline)
                    .foregroundColor(.brand)
            }
        }
    }
}
