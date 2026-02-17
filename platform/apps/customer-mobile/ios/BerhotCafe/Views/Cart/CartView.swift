import SwiftUI

struct CartView: View {
    @EnvironmentObject var cartManager: CartManager
    @StateObject private var viewModel = CartViewModel()
    @State private var showCheckout = false

    var body: some View {
        Group {
            if cartManager.isEmpty {
                EmptyStateView(
                    icon: "cart",
                    title: "Your cart is empty",
                    message: "Browse the menu and add items to get started"
                )
            } else {
                ScrollView {
                    VStack(spacing: 16) {
                        // Cart items
                        ForEach(cartManager.items) { item in
                            CartItemRow(item: item) { newQty in
                                cartManager.updateQuantity(productId: item.productId, quantity: newQty)
                            } onRemove: {
                                withAnimation {
                                    cartManager.removeItem(productId: item.productId)
                                }
                            }
                        }

                        // Summary
                        VStack(spacing: 8) {
                            SummaryRow(label: "Subtotal", value: cartManager.subtotal.formattedCurrency)
                            SummaryRow(label: "Tax (15%)", value: cartManager.taxAmount.formattedCurrency)
                            Divider()
                            SummaryRow(label: "Total", value: cartManager.total.formattedCurrency, isBold: true)
                        }
                        .padding()
                        .background(Color.surfaceSecondary)
                        .cornerRadius(16)
                    }
                    .padding()
                    .padding(.bottom, 80)
                }
                .overlay(alignment: .bottom) {
                    Button {
                        showCheckout = true
                    } label: {
                        HStack {
                            Text("Checkout")
                                .font(.body.bold())
                            Spacer()
                            Text(cartManager.total.formattedCurrency)
                                .font(.body.bold())
                        }
                        .padding(16)
                        .background(Color.brand)
                        .foregroundColor(.white)
                        .cornerRadius(14)
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 8)
                }
            }
        }
        .navigationTitle("Cart")
        .toolbar {
            if !cartManager.isEmpty {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Clear") {
                        withAnimation { cartManager.clear() }
                    }
                    .foregroundColor(.red)
                }
            }
        }
        .sheet(isPresented: $showCheckout) {
            CheckoutView(viewModel: viewModel)
        }
    }
}

struct CartItemRow: View {
    let item: CartItem
    let onQuantityChange: (Int) -> Void
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            // Image placeholder
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.surfaceSecondary)
                .frame(width: 60, height: 60)
                .overlay {
                    Image(systemName: "cup.and.saucer")
                        .foregroundColor(.textTertiary)
                }

            VStack(alignment: .leading, spacing: 4) {
                Text(item.productName)
                    .font(.subheadline.bold())
                    .foregroundColor(.textPrimary)
                    .lineLimit(1)

                Text(item.price.formattedCurrency)
                    .font(.caption)
                    .foregroundColor(.textSecondary)

                if let notes = item.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.caption2)
                        .foregroundColor(.textTertiary)
                        .lineLimit(1)
                }
            }

            Spacer()

            // Quantity controls
            HStack(spacing: 10) {
                Button {
                    if item.quantity > 1 {
                        onQuantityChange(item.quantity - 1)
                    } else {
                        onRemove()
                    }
                } label: {
                    Image(systemName: item.quantity == 1 ? "trash" : "minus")
                        .font(.caption.bold())
                        .frame(width: 28, height: 28)
                        .background(Color.surfaceSecondary)
                        .foregroundColor(item.quantity == 1 ? .red : .textPrimary)
                        .cornerRadius(8)
                }

                Text("\(item.quantity)")
                    .font(.subheadline.bold())
                    .frame(minWidth: 20)

                Button {
                    onQuantityChange(item.quantity + 1)
                } label: {
                    Image(systemName: "plus")
                        .font(.caption.bold())
                        .frame(width: 28, height: 28)
                        .background(Color.brand)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color.surfacePrimary)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.03), radius: 4, y: 1)
    }
}

struct SummaryRow: View {
    let label: String
    let value: String
    var isBold: Bool = false

    var body: some View {
        HStack {
            Text(label)
                .font(isBold ? .body.bold() : .subheadline)
                .foregroundColor(isBold ? .textPrimary : .textSecondary)
            Spacer()
            Text(value)
                .font(isBold ? .body.bold() : .subheadline)
                .foregroundColor(.textPrimary)
        }
    }
}
