import Foundation
import SwiftUI

@MainActor
class CartViewModel: ObservableObject {
    @Published var isPlacingOrder = false
    @Published var isProcessingPayment = false
    @Published var placedOrder: Order?
    @Published var error: String?

    func placeOrder(cart: CartManager) async {
        guard !cart.isEmpty else { return }
        isPlacingOrder = true
        error = nil

        let items = cart.items.map { item in
            CreateOrderItem(
                productId: item.productId,
                quantity: item.quantity,
                notes: item.notes
            )
        }

        let request = CreateOrderRequest(
            customerId: AuthManager.shared.currentUser?.id,
            orderType: "pickup",
            items: items,
            notes: nil
        )

        do {
            let order = try await OrderService.createOrder(request: request)
            self.placedOrder = order

            // Process payment
            isProcessingPayment = true
            let paymentRequest = PaymentRequest(
                orderId: order.id,
                amount: order.totalAmount,
                paymentMethod: "card",
                reference: nil
            )
            _ = try await PaymentService.processPayment(request: paymentRequest)

            cart.clear()
        } catch {
            self.error = error.localizedDescription
        }

        isPlacingOrder = false
        isProcessingPayment = false
    }
}
