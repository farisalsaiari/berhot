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

    var deliveryFee: Double { 5.0 }

    var taxRate: Double { 0.15 } // 15% VAT

    var taxAmount: Double {
        subtotal * taxRate
    }

    var total: Double {
        subtotal + taxAmount + deliveryFee
    }

    var isEmpty: Bool {
        items.isEmpty
    }

    func addItem(product: Product, quantity: Int = 1, notes: String? = nil, modifiers: [SelectedModifier] = []) {
        let newItem = CartItem(
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: quantity,
            notes: notes,
            imageUrl: product.imageUrl,
            modifiers: modifiers
        )

        // Match by composite ID (productId + modifiers)
        if let index = items.firstIndex(where: { $0.id == newItem.id }) {
            items[index].quantity += quantity
            if let notes = notes {
                items[index].notes = notes
            }
        } else {
            items.append(newItem)
        }
        saveToStorage()
    }

    func removeItem(id: String) {
        items.removeAll { $0.id == id }
        saveToStorage()
    }

    func updateQuantity(id: String, quantity: Int) {
        if let index = items.firstIndex(where: { $0.id == id }) {
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
