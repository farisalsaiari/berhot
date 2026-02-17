import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var cartManager: CartManager
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Home tab (SG60 icon style)
            HomeView()
                .tabItem {
                    if selectedTab == 0 {
                        Image(systemName: "house.fill")
                    } else {
                        Image(systemName: "house")
                    }
                    Text("Home")
                }
                .tag(0)

            // Discover
            NavigationStack {
                MenuView()
            }
            .tabItem {
                Image(systemName: "safari")
                Text("Discover")
            }
            .tag(1)

            // Activity (Orders)
            NavigationStack {
                OrderHistoryView()
            }
            .tabItem {
                Image(systemName: "doc.text")
                Text("Activity")
            }
            .tag(2)

            // Finance (Cart)
            NavigationStack {
                CartView()
            }
            .tabItem {
                Image(systemName: "dollarsign.circle")
                Text("Finance")
            }
            .badge(cartManager.itemCount > 0 ? cartManager.itemCount : 0)
            .tag(3)

            // Messages
            NavigationStack {
                MessagesPlaceholderView()
            }
            .tabItem {
                Image(systemName: "bubble.left")
                Text("Messages")
            }
            .tag(4)
        }
        .tint(Color(hex: "00B14F"))
    }
}

// MARK: - Messages Placeholder
struct MessagesPlaceholderView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "bubble.left.and.bubble.right")
                .font(.system(size: 48))
                .foregroundColor(Color(hex: "CCCCCC"))

            Text("No messages yet")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(.textPrimary)

            Text("Your conversations will appear here")
                .font(.system(size: 14))
                .foregroundColor(.textSecondary)
        }
        .navigationTitle("Messages")
    }
}
