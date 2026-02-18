import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var cartManager: CartManager
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Menu (Home page with products)
            HomeView()
                .tabItem {
                    Image(systemName: selectedTab == 0 ? "menucard.fill" : "menucard")
                    Text("Menu")
                }
                .tag(0)

            // Rewards
            NavigationStack {
                RewardsView()
            }
            .tabItem {
                Image(systemName: selectedTab == 1 ? "gift.fill" : "gift")
                Text("Rewards")
            }
            .tag(1)

            // Orders
            NavigationStack {
                OrderHistoryView()
            }
            .tabItem {
                Image(systemName: selectedTab == 2 ? "bag.fill" : "bag")
                Text("Orders")
            }
            .tag(2)

            // Account
            NavigationStack {
                ProfileView()
            }
            .tabItem {
                Image(systemName: selectedTab == 3 ? "person.fill" : "person")
                Text("Account")
            }
            .tag(3)

            // More
            NavigationStack {
                MoreView()
            }
            .tabItem {
                Image(systemName: "ellipsis")
                Text("More")
            }
            .tag(4)
        }
        .tint(Color(hex: "FFD300"))
    }
}
