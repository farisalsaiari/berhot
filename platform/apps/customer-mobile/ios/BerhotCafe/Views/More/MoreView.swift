import SwiftUI

struct MoreView: View {
    @EnvironmentObject var cartManager: CartManager

    private var menuItems: [(icon: String, title: String)] {[
        ("cart", L.cart),
        ("heart", L.favorites),
        ("bell", L.notifications),
        ("ticket", L.promotions),
        ("questionmark.circle", L.helpSupport),
        ("doc.text", L.termsConditions),
        ("shield.checkered", L.privacyPolicy),
        ("info.circle", L.about),
    ]}

    var body: some View {
        ScrollView {
            VStack(spacing: 2) {
                ForEach(menuItems, id: \.title) { item in
                    HStack(spacing: 14) {
                        Image(systemName: item.icon)
                            .font(.system(size: 18))
                            .foregroundColor(Color(hex: "FFD300"))
                            .frame(width: 32)

                        Text(item.title)
                            .font(.system(size: 16))
                            .foregroundColor(.textPrimary)

                        Spacer()

                        if item.title == L.cart && cartManager.itemCount > 0 {
                            Text("\(cartManager.itemCount)")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color.red)
                                .cornerRadius(10)
                        }

                        Image(systemName: "chevron.right")
                            .font(.system(size: 13))
                            .foregroundColor(.textTertiary)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 14)
                }
            }
            .background(Color.surfaceSecondary)
            .cornerRadius(16)
            .padding(.horizontal, 16)
            .padding(.top, 16)
        }
        .background(Color.white)
        .navigationTitle(L.more)
    }
}
