import SwiftUI

struct ErrorView: View {
    let message: String
    let retryAction: (() -> Void)?

    init(message: String, retryAction: (() -> Void)? = nil) {
        self.message = message
        self.retryAction = retryAction
    }

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 40))
                .foregroundColor(.orange)

            Text("Something went wrong")
                .font(.headline)
                .foregroundColor(.textPrimary)

            Text(message)
                .font(.subheadline)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)

            if let retry = retryAction {
                Button(action: retry) {
                    Text("Try Again")
                        .font(.body.bold())
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.brand)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
