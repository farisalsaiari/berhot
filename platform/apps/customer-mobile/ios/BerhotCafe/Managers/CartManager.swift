import Foundation
import SwiftUI

@MainActor
class CartManager: ObservableObject {
    @Published var items: [CartItem] = []

    private let storageKey = "berhot_cart"

    init() {
        loadFromStorage()
    }

    var itemCount: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    var subtotal: Double {
        items.reduce(0) { $0 + $1.totalPrice }
    }

    var taxRate: Double { 0.15 } // 15% VAT

    var taxAmount: Double {
        subtotal * taxRate
    }

    var total: Double {
        subtotal + taxAmount
    }

    var isEmpty: Bool {
        items.isEmpty
    }

    func addItem(product: Product, quantity: Int = 1, notes: String? = nil) {
        if let index = items.firstIndex(where: { $0.productId == product.id }) {
            items[index].quantity += quantity
            if let notes = notes {
                items[index].notes = notes
            }
        } else {
            let item = CartItem(
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: quantity,
                notes: notes,
                imageUrl: product.imageUrl
            )
            items.append(item)
        }
        saveToStorage()
    }

    func removeItem(productId: String) {
        items.removeAll { $0.productId == productId }
        saveToStorage()
    }

    func updateQuantity(productId: String, quantity: Int) {
        if let index = items.firstIndex(where: { $0.productId == productId }) {
            if quantity <= 0 {
                items.remove(at: index)
            } else {
                items[index].quantity = quantity
            }
            saveToStorage()
        }
    }

    func clear() {
        items.removeAll()
        saveToStorage()
    }

    // MARK: - Persistence

    private func saveToStorage() {
        if let data = try? JSONEncoder().encode(items) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func loadFromStorage() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let saved = try? JSONDecoder().decode([CartItem].self, from: data) {
            items = saved
        }
    }
}
