import SwiftUI

struct CheckoutView: View {
    @ObservedObject var viewModel: CartViewModel
    @EnvironmentObject var cartManager: CartManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Order summary
                VStack(spacing: 12) {
                    Image(systemName: "bag.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.brand)

                    Text("Confirm Order")
                        .font(.title3.bold())

                    Text("\(cartManager.itemCount) items")
                        .font(.subheadline)
                        .foregroundColor(.textSecondary)
                }
                .padding(.top, 20)

                // Totals
                VStack(spacing: 8) {
                    SummaryRow(label: "Subtotal", value: cartManager.subtotal.formattedCurrency)
                    SummaryRow(label: "Tax (15%)", value: cartManager.taxAmount.formattedCurrency)
                    Divider()
                    SummaryRow(label: "Total", value: cartManager.total.formattedCurrency, isBold: true)
                }
                .padding()
                .background(Color.surfaceSecondary)
                .cornerRadius(16)
                .padding(.horizontal)

                // Payment method
                HStack {
                    Image(systemName: "creditcard.fill")
                        .foregroundColor(.brand)
                    Text("Pay on pickup")
                        .font(.subheadline)
                        .foregroundColor(.textPrimary)
                    Spacer()
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
                .padding()
                .background(Color.surfaceSecondary)
                .cornerRadius(12)
                .padding(.horizontal)

                if let error = viewModel.error {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(.horizontal)
                }

                Spacer()

                // Place order button
                if let order = viewModel.placedOrder {
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 50))
                            .foregroundColor(.green)

                        Text("Order Placed!")
                            .font(.title3.bold())

                        Text("Order #\(order.orderNumber)")
                            .font(.subheadline)
                            .foregroundColor(.textSecondary)

                        Button("Done") {
                            dismiss()
                        }
                        .font(.body.bold())
                        .frame(maxWidth: .infinity)
                        .padding(16)
                        .background(Color.brand)
                        .foregroundColor(.white)
                        .cornerRadius(14)
                        .padding(.horizontal)
                    }
                } else {
                    Button {
                        Task {
                            await viewModel.placeOrder(cart: cartManager)
                        }
                    } label: {
                        HStack {
                            if viewModel.isPlacingOrder {
                                ProgressView().tint(.white)
                            }
                            Text(viewModel.isProcessingPayment ? "Processing payment..." : "Place Order")
                                .font(.body.bold())
                        }
                        .frame(maxWidth: .infinity)
                        .padding(16)
                        .background(Color.brand)
                        .foregroundColor(.white)
                        .cornerRadius(14)
                    }
                    .disabled(viewModel.isPlacingOrder)
                    .padding(.horizontal)
                }
            }
            .padding(.bottom, 20)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .foregroundColor(.textSecondary)
                    }
                }
            }
        }
    }
}
