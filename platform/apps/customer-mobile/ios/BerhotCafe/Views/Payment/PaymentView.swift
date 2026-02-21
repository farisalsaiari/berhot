import SwiftUI

struct PaymentView: View {
    @ObservedObject var viewModel: CartViewModel
    @EnvironmentObject var cartManager: CartManager
    @Environment(\.dismiss) private var dismiss
    @State private var showOrderConfirmation = false
    @State private var savedAddress = UserDefaults.standard.string(forKey: "saved_address") ?? ""
    @State private var showLocationFlow = false
    @State private var promoCode = ""

    private let brandGreen = Color(hex: "00B14F")

    var body: some View {
        NavigationStack {
            ZStack {
                Color(hex: "F7F7F7").ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        // Delivery Address
                        addressSection

                        // Order Summary
                        orderSummarySection

                        // Promo Code
                        promoSection

                        // Payment Methods
                        paymentMethodsSection

                        // Order Total
                        totalSection
                    }
                    .padding()
                    .padding(.bottom, 100)
                }

                // Pay button
                VStack {
                    Spacer()
                    payButton
                }
            }
            .navigationTitle(L.payment)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .foregroundColor(.textSecondary)
                    }
                }
            }
            .sheet(isPresented: $showLocationFlow) {
                LocationFlowView(isComplete: $showLocationFlow)
            }
            .fullScreenCover(isPresented: $showOrderConfirmation) {
                if let order = viewModel.placedOrder {
                    OrderConfirmationView(order: order)
                }
            }
            .alert(L.orderFailed, isPresented: Binding(
                get: { viewModel.error != nil },
                set: { if !$0 { viewModel.error = nil } }
            )) {
                Button(L.tryAgain) {
                    Task { await viewModel.placeOrder(cart: cartManager) }
                }
                Button(L.cancel, role: .cancel) {}
            } message: {
                Text(viewModel.error ?? L.somethingWentWrongTryAgain)
            }
        }
    }

    // MARK: - Address Section
    private var addressSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "location.fill")
                    .foregroundColor(brandGreen)
                Text(L.deliveryAddress)
                    .font(.system(size: 15, weight: .bold))
                Spacer()
            }

            if !savedAddress.isEmpty {
                HStack {
                    Image(systemName: "mappin.circle.fill")
                        .foregroundColor(.textTertiary)
                    Text(savedAddress)
                        .font(.system(size: 14))
                        .foregroundColor(.textPrimary)
                        .lineLimit(2)
                    Spacer()
                    Button(L.change) {
                        showLocationFlow = true
                    }
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(brandGreen)
                }
            } else {
                Button {
                    showLocationFlow = true
                } label: {
                    HStack {
                        Image(systemName: "plus.circle.fill")
                            .foregroundColor(brandGreen)
                        Text(L.addDeliveryAddress)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(brandGreen)
                    }
                }
            }
        }
        .padding(16)
        .background(Color.surfacePrimary)
        .cornerRadius(14)
    }

    // MARK: - Order Summary
    private var orderSummarySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: "bag.fill")
                    .foregroundColor(brandGreen)
                Text(L.orderSummary)
                    .font(.system(size: 15, weight: .bold))
                Text(L.itemsCount(cartManager.itemCount))
                    .font(.system(size: 13))
                    .foregroundColor(.textSecondary)
                Spacer()
            }

            ForEach(cartManager.items) { item in
                HStack {
                    Text("\(item.quantity)x")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(brandGreen)
                        .frame(width: 30, alignment: .leading)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(item.localizedProductName)
                            .font(.system(size: 14))
                            .foregroundColor(.textPrimary)
                        if let summary = item.modifiersSummary {
                            Text(summary)
                                .font(.system(size: 12))
                                .foregroundColor(.textTertiary)
                        }
                    }

                    Spacer()

                    Text(item.totalPrice.formattedCurrency)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.textPrimary)
                }
            }
        }
        .padding(16)
        .background(Color.surfacePrimary)
        .cornerRadius(14)
    }

    // MARK: - Promo
    private var promoSection: some View {
        HStack(spacing: 10) {
            Image(systemName: "ticket.fill")
                .foregroundColor(brandGreen)

            TextField(L.promoCode, text: $promoCode)
                .font(.system(size: 14))
                .textInputAutocapitalization(.characters)

            Button(L.apply) {}
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(brandGreen)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(brandGreen.opacity(0.1))
                .cornerRadius(8)
        }
        .padding(16)
        .background(Color.surfacePrimary)
        .cornerRadius(14)
    }

    // MARK: - Payment Methods
    private var paymentMethodsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(L.paymentMethod)
                .font(.system(size: 15, weight: .bold))
                .foregroundColor(.textPrimary)

            ForEach(CartViewModel.PaymentMethod.allCases, id: \.self) { method in
                Button {
                    viewModel.selectedPaymentMethod = method
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: method.icon)
                            .font(.system(size: 18))
                            .foregroundColor(viewModel.selectedPaymentMethod == method ? brandGreen : .textSecondary)
                            .frame(width: 28)

                        Text(method.displayName)
                            .font(.system(size: 14))
                            .foregroundColor(.textPrimary)

                        Spacer()

                        Image(systemName: viewModel.selectedPaymentMethod == method
                              ? "circle.inset.filled" : "circle")
                            .font(.system(size: 20))
                            .foregroundColor(viewModel.selectedPaymentMethod == method ? brandGreen : Color(hex: "CCCCCC"))
                    }
                    .padding(.vertical, 6)
                }
            }
        }
        .padding(16)
        .background(Color.surfacePrimary)
        .cornerRadius(14)
    }

    // MARK: - Total
    private var totalSection: some View {
        VStack(spacing: 8) {
            SummaryRow(label: L.subtotal, value: cartManager.subtotal.formattedCurrency)
            SummaryRow(label: L.deliveryFee, value: cartManager.deliveryFee.formattedCurrency)
            SummaryRow(label: L.tax15, value: cartManager.taxAmount.formattedCurrency)
            Divider()
            SummaryRow(label: L.total, value: cartManager.total.formattedCurrency, isBold: true)
        }
        .padding(16)
        .background(Color.surfacePrimary)
        .cornerRadius(14)
    }

    // MARK: - Pay Button
    private var payButton: some View {
        Button {
            Task {
                await viewModel.placeOrder(cart: cartManager)
                if viewModel.placedOrder != nil {
                    showOrderConfirmation = true
                }
            }
        } label: {
            HStack {
                if viewModel.isPlacingOrder {
                    ProgressView().tint(.white)
                }
                Text(viewModel.isProcessingPayment
                     ? L.processing
                     : L.payAmount(cartManager.total.formattedCurrency))
                    .font(.system(size: 16, weight: .bold))
            }
            .frame(maxWidth: .infinity)
            .padding(16)
            .background(viewModel.isPlacingOrder ? Color.gray : brandGreen)
            .foregroundColor(.white)
            .cornerRadius(14)
        }
        .disabled(viewModel.isPlacingOrder)
        .padding(.horizontal, 16)
        .padding(.bottom, 16)
        .background(Color(hex: "F7F7F7"))
    }
}
