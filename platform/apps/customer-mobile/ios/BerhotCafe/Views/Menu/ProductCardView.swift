import SwiftUI

struct ProductCardView: View {
    let product: Product
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 8) {
                // Image (cached with shimmer)
                CachedAsyncImage(url: product.resolvedImageUrl) {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.surfaceSecondary)
                        .overlay(
                            Image(systemName: "cup.and.saucer")
                                .font(.title2)
                                .foregroundColor(.textTertiary)
                        )
                }
                .frame(height: 120)
                .cornerRadius(12)

                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.localizedName)
                        .font(.subheadline.bold())
                        .foregroundColor(.textPrimary)
                        .lineLimit(1)

                    if let desc = product.localizedDescription, !desc.isEmpty {
                        Text(desc)
                            .font(.caption)
                            .foregroundColor(.textSecondary)
                            .lineLimit(2)
                    }

                    Text(product.price.formattedCurrency)
                        .font(.subheadline.bold())
                        .foregroundColor(.brand)
                }
            }
            .padding(10)
            .background(Color.surfacePrimary)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
        }
        .buttonStyle(.plain)
    }
}
