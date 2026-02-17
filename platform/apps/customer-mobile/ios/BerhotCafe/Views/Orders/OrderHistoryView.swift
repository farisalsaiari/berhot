import SwiftUI

struct OrderHistoryView: View {
    @StateObject private var viewModel = OrderHistoryViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                LoadingView(message: "Loading orders...")
            } else if viewModel.orders.isEmpty {
                EmptyStateView(
                    icon: "list.clipboard",
                    title: "No orders yet",
                    message: "Your order history will appear here"
                )
            } else {
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(viewModel.orders) { order in
                            NavigationLink(destination: OrderDetailView(orderId: order.id)) {
                                OrderRow(order: order)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("My Orders")
        .refreshable {
            await viewModel.loadOrders()
        }
        .task {
            await viewModel.loadOrders()
        }
    }
}

struct OrderRow: View {
    let order: Order

    var body: some View {
        HStack(spacing: 12) {
            // Status icon
            Circle()
                .fill(Color.statusColor(for: order.status).opacity(0.15))
                .frame(width: 44, height: 44)
                .overlay {
                    Image(systemName: statusIcon)
                        .font(.body)
                        .foregroundColor(Color.statusColor(for: order.status))
                }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Order #\(order.orderNumber)")
                        .font(.subheadline.bold())
                        .foregroundColor(.textPrimary)

                    Spacer()

                    Text(order.resolvedTotal.formattedCurrency)
                        .font(.subheadline.bold())
                        .foregroundColor(.textPrimary)
                }

                HStack {
                    StatusBadge(status: order.status)

                    Text("·")
                        .foregroundColor(.textTertiary)

                    Text(order.formattedDate)
                        .font(.caption)
                        .foregroundColor(.textTertiary)

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.textTertiary)
                }
            }
        }
        .padding()
        .background(Color.surfacePrimary)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.03), radius: 4, y: 1)
    }

    private var statusIcon: String {
        switch order.status.lowercased() {
        case "pending": return "clock"
        case "preparing": return "flame"
        case "ready": return "bell.badge"
        case "completed": return "checkmark.circle"
        case "cancelled": return "xmark.circle"
        default: return "circle"
        }
    }
}
