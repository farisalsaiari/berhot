import SwiftUI

// Observable class to share tab bar visibility across views
class TabBarVisibility: ObservableObject {
    @Published var isVisible: Bool = true
}

struct MainTabView: View {
    @EnvironmentObject var cartManager: CartManager
    @StateObject private var tabBarVisibility = TabBarVisibility()
    @State private var selectedTab = 0

    private let brandYellow = Color(hex: "FFD300")

    var body: some View {
        ZStack(alignment: .bottom) {
            // Content
            Group {
                switch selectedTab {
                case 0:
                    HomeView()
                case 1:
                    NavigationStack { RewardsView() }
                case 2:
                    NavigationStack { OrderHistoryView() }
                case 3:
                    NavigationStack { ProfileView() }
                case 4:
                    NavigationStack { MoreView() }
                default:
                    HomeView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            // Custom Tab Bar
            customTabBar
                .offset(y: tabBarVisibility.isVisible ? 0 : 100) // slide down to hide
                .animation(.easeInOut(duration: 0.25), value: tabBarVisibility.isVisible)
        }
        .environmentObject(tabBarVisibility)
        .ignoresSafeArea(.keyboard) // prevent tab bar from jumping with keyboard
    }

    // MARK: - Custom Tab Bar
    private var customTabBar: some View {
        HStack(spacing: 0) {
            tabBarItem(icon: "menucard", activeIcon: "menucard.fill", label: "Menu", tag: 0)
            tabBarItem(icon: "gift", activeIcon: "gift.fill", label: "Rewards", tag: 1)
            tabBarItem(icon: "bag", activeIcon: "bag.fill", label: "Orders", tag: 2)
            tabBarItem(icon: "person", activeIcon: "person.fill", label: "Account", tag: 3)
            tabBarItem(icon: "ellipsis", activeIcon: "ellipsis", label: "More", tag: 4)
        }
        .padding(.top, 10)
        .padding(.bottom, 28) // account for home indicator safe area
        .background(
            Color.white
                .edgesIgnoringSafeArea(.bottom)
        )
    }

    private func tabBarItem(icon: String, activeIcon: String, label: String, tag: Int) -> some View {
        Button {
            selectedTab = tag
            // Always show tab bar when switching tabs
            tabBarVisibility.isVisible = true
        } label: {
            VStack(spacing: 4) {
                Image(systemName: selectedTab == tag ? activeIcon : icon)
                    .font(.system(size: 20))
                    .frame(height: 24)
                Text(label)
                    .font(.system(size: 10, weight: .medium))
            }
            .foregroundColor(selectedTab == tag ? brandYellow : Color(hex: "999999"))
            .frame(maxWidth: .infinity)
        }
    }
}
