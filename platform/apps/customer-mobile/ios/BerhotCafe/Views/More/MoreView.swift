import SwiftUI

struct MoreView: View {
    @EnvironmentObject var cartManager: CartManager

    private let menuItems: [(icon: String, title: String)] = [
        ("cart", "Cart"),
        ("heart", "Favorites"),
        ("bell", "Notifications"),
        ("ticket", "Promotions"),
        ("questionmark.circle", "Help & Support"),
        ("doc.text", "Terms & Conditions"),
        ("shield.checkered", "Privacy Policy"),
        ("info.circle", "About"),
    ]

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

                        if item.title == "Cart" && cartManager.itemCount > 0 {
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
        .navigationTitle("More")
    }
}
