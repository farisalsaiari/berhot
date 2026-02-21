import SwiftUI

struct CartView: View {
    @EnvironmentObject var cartManager: CartManager
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var viewModel = CartViewModel()
    @State private var showPayment = false
    @State private var showSignIn = false

    var body: some View {
        Group {
            if cartManager.isEmpty {
                EmptyStateView(
                    icon: "cart",
                    title: L.yourCartEmpty,
                    message: L.browseMenuAddItems
                )
            } else {
                ScrollView {
                    VStack(spacing: 16) {
                        // Cart items
                        ForEach(cartManager.items) { item in
                            CartItemRow(item: item) { newQty in
                                cartManager.updateQuantity(id: item.id, quantity: newQty)
                            } onRemove: {
                                withAnimation {
                                    cartManager.removeItem(id: item.id)
                                }
                            }
                        }

                        // Summary
                        VStack(spacing: 8) {
                            SummaryRow(label: L.subtotal, value: cartManager.subtotal.formattedCurrency)
                            SummaryRow(label: L.deliveryFee, value: cartManager.deliveryFee.formattedCurrency)
                            SummaryRow(label: L.tax15, value: cartManager.taxAmount.formattedCurrency)
                            Divider()
                            SummaryRow(label: L.total, value: cartManager.total.formattedCurrency, isBold: true)
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
                        if authManager.isAuthenticated {
                            showPayment = true
                        } else {
                            showSignIn = true
                        }
                    } label: {
                        HStack {
                            Text(L.proceedToPayment)
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
        .navigationTitle(L.cart)
        .toolbar {
            if !cartManager.isEmpty {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(L.clear) {
                        withAnimation { cartManager.clear() }
                    }
                    .foregroundColor(.red)
                }
            }
        }
        .sheet(isPresented: $showPayment) {
            PaymentView(viewModel: viewModel)
        }
        .sheet(isPresented: $showSignIn) {
            SignInSheetView()
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
        }
        .onChange(of: authManager.isAuthenticated) { isAuth in
            if isAuth && !showPayment {
                // User just signed in — open payment automatically
                showPayment = true
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .guestCheckoutRequested)) { _ in
            // Guest checkout: go straight to payment
            showPayment = true
        }
    }
}

struct CartItemRow: View {
    let item: CartItem
    let onQuantityChange: (Int) -> Void
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            // Product image (cached)
            CachedAsyncImage(url: item.resolvedImageUrl) {
                RoundedRectangle(cornerRadius: 10).fill(Color.surfaceSecondary)
                    .overlay(Image(systemName: "cup.and.saucer").foregroundColor(.textTertiary))
            }
            .frame(width: 60, height: 60)
            .clipShape(RoundedRectangle(cornerRadius: 10))

            VStack(alignment: .leading, spacing: 4) {
                Text(item.localizedProductName)
                    .font(.subheadline.bold())
                    .foregroundColor(.textPrimary)
                    .lineLimit(1)

                if let summary = item.modifiersSummary {
                    Text(summary)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                        .lineLimit(1)
                }

                Text(item.unitTotal.formattedCurrency)
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
