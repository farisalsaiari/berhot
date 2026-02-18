import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var cartManager: CartManager
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Home — DoorDash-style store page
            HomeView()
                .tabItem {
                    Image(systemName: selectedTab == 0 ? "house.fill" : "house")
                    Text("Home")
                }
                .tag(0)

            // Menu — browse/search all products
            NavigationStack {
                MenuView()
            }
            .tabItem {
                Image(systemName: "fork.knife")
                Text("Menu")
            }
            .tag(1)

            // Orders — order history
            NavigationStack {
                OrderHistoryView()
            }
            .tabItem {
                Image(systemName: "bag")
                Text("Orders")
            }
            .tag(2)

            // Cart
            NavigationStack {
                CartView()
            }
            .tabItem {
                Image(systemName: "cart")
                Text("Cart")
            }
            .badge(cartManager.itemCount > 0 ? cartManager.itemCount : 0)
            .tag(3)

            // Account
            NavigationStack {
                ProfileView()
            }
            .tabItem {
                Image(systemName: selectedTab == 4 ? "person.crop.circle.fill" : "person.crop.circle")
                Text("Account")
            }
            .tag(4)
        }
        .tint(Color(hex: "FFD300"))
    }
}
