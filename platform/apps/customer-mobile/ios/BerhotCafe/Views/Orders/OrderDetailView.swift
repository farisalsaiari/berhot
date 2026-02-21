import SwiftUI

struct OrderDetailView: View {
    let orderId: String
    @StateObject private var viewModel: OrderDetailViewModel
    @State private var showRating = false

    init(orderId: String) {
        self.orderId = orderId
        self._viewModel = StateObject(wrappedValue: OrderDetailViewModel(orderId: orderId))
    }

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingView(message: L.loadingOrder)
            } else if let order = viewModel.order {
                ScrollView {
                    VStack(spacing: 20) {
                        // Status header
                        OrderTrackingView(status: order.status)

                        // Order info
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text(L.orderNumber(order.orderNumber))
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
                            Text(L.itemsLabel)
                                .font(.headline)

                            if let items = order.items {
                                ForEach(items) { item in
                                    VStack(alignment: .leading, spacing: 4) {
                                        HStack {
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text(item.displayName)
                                                    .font(.subheadline)
                                                    .foregroundColor(.textPrimary)
                                                Text("x\(item.quantity) · \(item.unitPrice.formattedCurrency) \(L.each)")
                                                    .font(.caption)
                                                    .foregroundColor(.textSecondary)
                                            }
                                            Spacer()
                                            Text(item.totalPrice.formattedCurrency)
                                                .font(.subheadline.bold())
                                        }

                                        if let mods = item.modifiers, !mods.isEmpty {
                                            let modNames = mods.compactMap(\.name).joined(separator: ", ")
                                            if !modNames.isEmpty {
                                                Text(modNames)
                                                    .font(.caption)
                                                    .foregroundColor(.textTertiary)
                                            }
                                        }
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
                            SummaryRow(label: L.subtotal, value: order.subtotal.formattedCurrency)
                            if order.taxAmount > 0 {
                                SummaryRow(label: L.tax, value: order.taxAmount.formattedCurrency)
                            }
                            if let disc = order.discountAmount, disc > 0 {
                                SummaryRow(label: L.discount, value: "-\(disc.formattedCurrency)")
                            }
                            Divider()
                            SummaryRow(label: L.total, value: order.resolvedTotal.formattedCurrency, isBold: true)
                        }
                        .padding()
                        .background(Color.surfaceSecondary)
                        .cornerRadius(16)

                        if let notes = order.notes, !notes.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(L.notes).font(.headline)
                                Text(notes)
                                    .font(.subheadline)
                                    .foregroundColor(.textSecondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(Color.surfaceSecondary)
                            .cornerRadius(16)
                        }

                        // Rate button for completed orders
                        if order.isCompleted {
                            Button {
                                showRating = true
                            } label: {
                                HStack {
                                    Image(systemName: "star.fill")
                                    Text(L.rateYourExperience)
                                        .font(.body.bold())
                                }
                                .frame(maxWidth: .infinity)
                                .padding(16)
                                .background(Color(hex: "00B14F"))
                                .foregroundColor(.white)
                                .cornerRadius(14)
                            }
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
        .navigationTitle(L.orderDetails)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadOrder()
            viewModel.startPolling()
        }
        .onDisappear {
            viewModel.stopPolling()
        }
        .sheet(isPresented: $showRating) {
            RateOrderView(orderId: orderId, orderItems: viewModel.order?.items)
        }
    }
}
