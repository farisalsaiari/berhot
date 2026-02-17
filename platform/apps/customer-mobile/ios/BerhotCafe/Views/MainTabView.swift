import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var cartManager: CartManager
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                MenuView()
            }
            .tabItem {
                Image(systemName: "menucard")
                Text("Menu")
            }
            .tag(0)

            NavigationStack {
                CartView()
            }
            .tabItem {
                Image(systemName: "cart")
                Text("Cart")
            }
            .badge(cartManager.itemCount > 0 ? cartManager.itemCount : 0)
            .tag(1)

            NavigationStack {
                OrderHistoryView()
            }
            .tabItem {
                Image(systemName: "list.clipboard")
                Text("Orders")
            }
            .tag(2)

            NavigationStack {
                ProfileView()
            }
            .tabItem {
                Image(systemName: "person")
                Text("Profile")
            }
            .tag(3)
        }
        .tint(.brand)
    }
}
