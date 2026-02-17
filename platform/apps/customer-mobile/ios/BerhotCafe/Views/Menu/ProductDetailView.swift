import SwiftUI

struct ProductDetailView: View {
    let product: Product
    @EnvironmentObject var cartManager: CartManager
    @Environment(\.dismiss) private var dismiss
    @State private var quantity = 1
    @State private var notes = ""
    @State private var addedToCart = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Image
                    ZStack {
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color.surfaceSecondary)

                        if let imageUrl = product.imageUrl, let url = URL(string: imageUrl) {
                            AsyncImage(url: url) { image in
                                image.resizable().aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Image(systemName: "cup.and.saucer.fill")
                                    .font(.system(size: 50))
                                    .foregroundColor(.textTertiary)
                            }
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .clipped()
                        } else {
                            Image(systemName: "cup.and.saucer.fill")
                                .font(.system(size: 50))
                                .foregroundColor(.textTertiary)
                        }
                    }
                    .frame(height: 250)
                    .cornerRadius(16)
                    .padding(.horizontal)

                    // Details
                    VStack(alignment: .leading, spacing: 12) {
                        Text(product.name)
                            .font(.title2.bold())
                            .foregroundColor(.textPrimary)

                        Text(product.price.formattedCurrency)
                            .font(.title3.bold())
                            .foregroundColor(.brand)

                        if let desc = product.description, !desc.isEmpty {
                            Text(desc)
                                .font(.body)
                                .foregroundColor(.textSecondary)
                        }

                        if let category = product.category {
                            HStack {
                                Image(systemName: "tag")
                                    .font(.caption)
                                Text(category.name)
                                    .font(.caption.weight(.medium))
                            }
                            .foregroundColor(.textTertiary)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.surfaceSecondary)
                            .cornerRadius(8)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)

                    // Notes
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Special Instructions")
                            .font(.subheadline.bold())
                            .foregroundColor(.textPrimary)

                        TextField("Any special requests...", text: $notes, axis: .vertical)
                            .lineLimit(3...5)
                            .padding(12)
                            .background(Color.surfaceSecondary)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal)

                    // Quantity
                    HStack {
                        Text("Quantity")
                            .font(.subheadline.bold())
                            .foregroundColor(.textPrimary)

                        Spacer()

                        HStack(spacing: 16) {
                            Button {
                                if quantity > 1 { quantity -= 1 }
                            } label: {
                                Image(systemName: "minus.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(quantity > 1 ? .brand : .gray.opacity(0.3))
                            }

                            Text("\(quantity)")
                                .font(.title3.bold())
                                .frame(minWidth: 30)

                            Button {
                                quantity += 1
                            } label: {
                                Image(systemName: "plus.circle.fill")
                                    .font(.title2)
                                    .foregroundColor(.brand)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 100)
            }
            .overlay(alignment: .bottom) {
                // Add to cart button
                Button {
                    cartManager.addItem(
                        product: product,
                        quantity: quantity,
                        notes: notes.isEmpty ? nil : notes
                    )
                    addedToCart = true
                    let impact = UIImpactFeedbackGenerator(style: .medium)
                    impact.impactOccurred()
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                        dismiss()
                    }
                } label: {
                    HStack {
                        Image(systemName: addedToCart ? "checkmark" : "cart.badge.plus")
                        Text(addedToCart ? "Added!" : "Add to Cart — \((product.price * Double(quantity)).formattedCurrency)")
                            .font(.body.bold())
                    }
                    .frame(maxWidth: .infinity)
                    .padding(16)
                    .background(addedToCart ? Color.green : Color.brand)
                    .foregroundColor(.white)
                    .cornerRadius(14)
                }
                .padding(.horizontal)
                .padding(.bottom, 16)
                .background(
                    LinearGradient(
                        colors: [Color.surfacePrimary.opacity(0), Color.surfacePrimary],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 60)
                    .offset(y: -30)
                    .allowsHitTesting(false)
                )
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.textTertiary)
                    }
                }
            }
        }
    }
}
