import Foundation
import SwiftUI

@MainActor
class CartViewModel: ObservableObject {
    @Published var isPlacingOrder = false
    @Published var isProcessingPayment = false
    @Published var placedOrder: Order?
    @Published var error: String?
    @Published var selectedPaymentMethod: PaymentMethod = .cash

    enum PaymentMethod: String, CaseIterable {
        case applePay = "apple_pay"
        case card = "card"
        case cash = "cash"
        case wallet = "wallet"

        var displayName: String {
            switch self {
            case .applePay: return "Apple Pay"
            case .card: return "Visa •••• 6411"
            case .cash: return "Cash on Delivery"
            case .wallet: return "Wallet"
            }
        }

        var icon: String {
            switch self {
            case .applePay: return "apple.logo"
            case .card: return "creditcard.fill"
            case .cash: return "banknote.fill"
            case .wallet: return "wallet.pass.fill"
            }
        }
    }

    func placeOrder(cart: CartManager) async {
        guard !cart.isEmpty else { return }
        isPlacingOrder = true
        error = nil

        let items = cart.items.map { item in
            let mods: [CreateOrderModifier]? = item.modifiers.isEmpty ? nil : item.modifiers.map { m in
                CreateOrderModifier(
                    modifierItemId: m.itemId,
                    name: m.itemName,
                    priceAdjustment: m.priceAdjustment
                )
            }
            return CreateOrderItem(
                productId: item.productId,
                quantity: item.quantity,
                notes: item.notes,
                modifiers: mods
            )
        }

        let request = CreateOrderRequest(
            customerId: AuthManager.shared.currentUser?.id,
            orderType: "delivery",
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
                amount: order.resolvedTotal,
                paymentMethod: selectedPaymentMethod.rawValue,
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
