import Foundation

struct CartItem: Codable, Identifiable {
    var id: String { productId }
    let productId: String
    let productName: String
    let price: Double
    var quantity: Int
    var notes: String?
    let imageUrl: String?

    var totalPrice: Double {
        price * Double(quantity)
    }
}
