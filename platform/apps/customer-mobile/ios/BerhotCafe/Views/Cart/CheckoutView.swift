import SwiftUI

// Legacy CheckoutView - now redirects to PaymentView
struct CheckoutView: View {
    @ObservedObject var viewModel: CartViewModel
    @EnvironmentObject var cartManager: CartManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        PaymentView(viewModel: viewModel)
    }
}
