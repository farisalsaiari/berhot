import SwiftUI

struct OrderDetailView: View {
    let orderId: String
    @StateObject private var viewModel: OrderDetailViewModel

    init(orderId: String) {
        self.orderId = orderId
        self._viewModel = StateObject(wrappedValue: OrderDetailViewModel(orderId: orderId))
    }

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingView(message: "Loading order...")
            } else if let order = viewModel.order {
                ScrollView {
                    VStack(spacing: 20) {
                        // Status header
                        OrderTrackingView(status: order.status)

                        // Order info
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("Order #\(order.orderNumber)")
                                    .font(.title3.bold())
                                Spacer()
                                StatusBadge(status: order.status)
                            }

                            HStack {
                                Image(systemName: "clock")
                                    .foregroundColor(.textTertiary)
                                Text(order.formattedDate)
                                    .font(.subheadline)
                                    .foregroundColor(.textSecondary)
                            }

                            HStack {
                                Image(systemName: order.orderType == "delivery" ? "bicycle" : "bag")
                                    .foregroundColor(.textTertiary)
                                Text(order.orderType.capitalized)
                                    .font(.subheadline)
                                    .foregroundColor(.textSecondary)
                            }
                        }
                        .padding()
                        .background(Color.surfaceSecondary)
                        .cornerRadius(16)

                        // Items
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Items")
                                .font(.headline)

                            if let items = order.items {
                                ForEach(items) { item in
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(item.productName)
                                                .font(.subheadline)
                                                .foregroundColor(.textPrimary)
                                            Text("x\(item.quantity) · \(item.unitPrice.formattedCurrency) each")
                                                .font(.caption)
                                                .foregroundColor(.textSecondary)
                                        }
                                        Spacer()
                                        Text(item.totalPrice.formattedCurrency)
                                            .font(.subheadline.bold())
                                    }
                                    if item.id != items.last?.id {
                                        Divider()
                                    }
                                }
                            }
                        }
                        .padding()
                        .background(Color.surfaceSecondary)
                        .cornerRadius(16)

                        // Totals
                        VStack(spacing: 8) {
                            SummaryRow(label: "Subtotal", value: order.subtotal.formattedCurrency)
                            if order.taxAmount > 0 {
                                SummaryRow(label: "Tax", value: order.taxAmount.formattedCurrency)
                            }
                            if order.discountAmount > 0 {
                                SummaryRow(label: "Discount", value: "-\(order.discountAmount.formattedCurrency)")
                            }
                            Divider()
                            SummaryRow(label: "Total", value: order.totalAmount.formattedCurrency, isBold: true)
                        }
                        .padding()
                        .background(Color.surfaceSecondary)
                        .cornerRadius(16)

                        if let notes = order.notes, !notes.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Notes")
                                    .font(.headline)
                                Text(notes)
                                    .font(.subheadline)
                                    .foregroundColor(.textSecondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color.surfaceSecondary)
                            .cornerRadius(16)
                        }
                    }
                    .padding()
                }
            } else if let error = viewModel.error {
                ErrorView(message: error) {
                    Task { await viewModel.loadOrder() }
                }
            }
        }
        .navigationTitle("Order Details")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadOrder()
            viewModel.startPolling()
        }
        .onDisappear {
            viewModel.stopPolling()
        }
    }
}
