import SwiftUI

struct RewardsView: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "gift.fill")
                .font(.system(size: 56))
                .foregroundColor(Color(hex: "FFD300"))

            Text("Rewards")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.textPrimary)

            Text("Earn points with every order.\nComing soon!")
                .font(.system(size: 15))
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.white)
        .navigationTitle("Rewards")
    }
}
