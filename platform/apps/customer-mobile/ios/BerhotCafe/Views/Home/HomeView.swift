import SwiftUI

struct HomeView: View {
    @EnvironmentObject var authManager: AuthManager
    @EnvironmentObject var cartManager: CartManager
    @State private var searchText = ""
    @State private var showProfile = false

    // Gradient colors matching the Grab green header
    private let headerGradient = LinearGradient(
        colors: [
            Color(hex: "00B14F"),
            Color(hex: "00A547"),
            Color(hex: "009E42")
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    var body: some View {
        ZStack(alignment: .top) {
            // Background
            Color(hex: "F5F5F5")
                .ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    // ── Green Header with Search ─────────────
                    headerSection

                    // ── Service Grid ─────────────────────────
                    serviceGrid
                        .padding(.top, 16)

                    // ── Action Cards (GrabPay, Email, Rewards) ──
                    actionCards
                        .padding(.top, 16)

                    // ── Promo Banner ─────────────────────────
                    promoBanner
                        .padding(.top, 20)

                    // ── Ride Offers ──────────────────────────
                    rideOffers
                        .padding(.top, 12)
                        .padding(.bottom, 20)
                }
            }
        }
        .sheet(isPresented: $showProfile) {
            NavigationStack {
                ProfileView()
            }
        }
    }

    // MARK: - Header
    private var headerSection: some View {
        ZStack(alignment: .bottom) {
            // Green gradient background
            headerGradient
                .frame(height: 140)
                .ignoresSafeArea(edges: .top)

            // Search bar + icons
            HStack(spacing: 12) {
                // QR/Scan icon
                Button(action: {}) {
                    Image(systemName: "qrcode.viewfinder")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.white)
                        .frame(width: 40, height: 40)
                        .background(Color.white.opacity(0.2))
                        .cornerRadius(12)
                }

                // Search bar
                HStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 15))
                        .foregroundColor(Color(hex: "999999"))
                    Text("Search places")
                        .font(.system(size: 15))
                        .foregroundColor(Color(hex: "999999"))
                    Spacer()
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 11)
                .background(Color.white)
                .cornerRadius(25)

                // Profile icon
                Button(action: { showProfile = true }) {
                    if let user = authManager.currentUser {
                        Text(user.initials)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(Color(hex: "00B14F"))
                            .frame(width: 40, height: 40)
                            .background(Color.white)
                            .clipShape(Circle())
                    } else {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.white)
                            .frame(width: 40, height: 40)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 16)
        }
    }

    // MARK: - Service Grid (2 rows x 4 columns)
    private var serviceGrid: some View {
        VStack(spacing: 12) {
            // Row 1
            HStack(spacing: 0) {
                ServiceItem(icon: "fork.knife", label: "Food", color: Color(hex: "FF6B35"), badgeText: nil)
                ServiceItem(icon: "car.fill", label: "Transport", color: Color(hex: "00B14F"), badgeText: nil)
                ServiceItem(icon: "bag.fill", label: "Mart", color: Color(hex: "FF4757"), badgeText: nil)
                ServiceItem(icon: "fork.knife.circle.fill", label: "Dine Out", color: Color(hex: "FF9F43"), badgeText: nil)
            }

            // Row 2
            HStack(spacing: 0) {
                ServiceItem(icon: "cart.fill", label: "Shopping", color: Color(hex: "FF6B35"), badgeText: "SALE")
                ServiceItem(icon: "c.circle.fill", label: "Chope", color: Color(hex: "FFB800"), badgeText: nil)
                ServiceItem(icon: "clock.arrow.circlepath", label: "Ride later", color: Color(hex: "00B14F"), badgeText: nil)
                ServiceItem(icon: "square.grid.2x2.fill", label: "All", color: Color(hex: "00B14F"), badgeText: nil)
            }
        }
        .padding(.horizontal, 16)
    }

    // MARK: - Action Cards
    private var actionCards: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ActionCard(
                    topLabel: "Activate",
                    mainLabel: "GrabPay",
                    icon: "creditcard.fill",
                    iconColor: Color(hex: "00B14F"),
                    bgColor: Color(hex: "F0FFF4")
                )

                ActionCard(
                    topLabel: "Account",
                    mainLabel: "Add Email",
                    icon: "envelope.fill",
                    iconColor: Color(hex: "00B14F"),
                    bgColor: Color(hex: "F0FFF4")
                )

                ActionCard(
                    topLabel: "GrabRewards",
                    mainLabel: "0",
                    icon: "star.fill",
                    iconColor: Color(hex: "FFB800"),
                    bgColor: Color(hex: "FFFBEB")
                )
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Promo Banner
    private var promoBanner: some View {
        ZStack(alignment: .bottomLeading) {
            // Background gradient
            LinearGradient(
                colors: [
                    Color(hex: "E8F5E9"),
                    Color(hex: "FFF9C4"),
                    Color(hex: "BBDEFB")
                ],
                startPoint: .leading,
                endPoint: .trailing
            )
            .frame(height: 200)
            .cornerRadius(20)

            // Decorative skyline silhouette
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    // Stylized building shapes
                    ZStack(alignment: .bottom) {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color(hex: "90CAF9").opacity(0.6))
                            .frame(width: 60, height: 120)
                            .offset(x: 20, y: 0)

                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color(hex: "64B5F6").opacity(0.7))
                            .frame(width: 45, height: 90)
                            .offset(x: -20, y: 0)

                        // Dome shape
                        Ellipse()
                            .fill(Color(hex: "42A5F5").opacity(0.5))
                            .frame(width: 80, height: 40)
                            .offset(x: 0, y: -80)
                    }
                    .padding(.trailing, 30)
                }
            }

            // Text content
            VStack(alignment: .leading, spacing: 6) {
                Spacer()

                HStack(spacing: 6) {
                    Text("Buy Travel Pass now")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.black)

                    Image(systemName: "chevron.right.circle.fill")
                        .font(.system(size: 18))
                        .foregroundColor(.black.opacity(0.7))
                }

                Text("Save up to S$120.00 for just S$1.00")
                    .font(.system(size: 14))
                    .foregroundColor(.black.opacity(0.7))
            }
            .padding(20)
        }
        .padding(.horizontal, 16)
    }

    // MARK: - Ride Offers
    private var rideOffers: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                RideOfferCard(
                    text: "10% off All\nride types",
                    bgColor: Color(hex: "FFC107"),
                    iconName: "car.fill",
                    iconColor: Color(hex: "00B14F")
                )

                RideOfferCard(
                    text: "Up to 50% off\nAirport rides",
                    bgColor: Color(hex: "FFD54F"),
                    iconName: "airplane",
                    iconColor: Color(hex: "1E88E5")
                )

                RideOfferCard(
                    text: "15% off\nAirport rides",
                    bgColor: Color(hex: "FFE082"),
                    iconName: "airplane.departure",
                    iconColor: Color(hex: "1E88E5")
                )
            }
            .padding(.horizontal, 16)
        }
    }
}

// MARK: - Service Grid Item
struct ServiceItem: View {
    let icon: String
    let label: String
    let color: Color
    let badgeText: String?

    var body: some View {
        VStack(spacing: 6) {
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white)
                    .frame(width: 72, height: 72)
                    .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)

                Image(systemName: icon)
                    .font(.system(size: 26))
                    .foregroundColor(color)
                    .frame(width: 72, height: 72)

                if let badge = badgeText {
                    Text(badge)
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(Color(hex: "FF4757"))
                        .cornerRadius(4)
                        .offset(x: 4, y: 4)
                }
            }

            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(Color(hex: "333333"))
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Action Card
struct ActionCard: View {
    let topLabel: String
    let mainLabel: String
    let icon: String
    let iconColor: Color
    let bgColor: Color

    var body: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 2) {
                Text(topLabel)
                    .font(.system(size: 11))
                    .foregroundColor(Color(hex: "888888"))

                Text(mainLabel)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(Color(hex: "222222"))
            }

            Spacer()

            Image(systemName: icon)
                .font(.system(size: 22))
                .foregroundColor(iconColor)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 14)
        .frame(width: 160, height: 60)
        .background(bgColor)
        .cornerRadius(14)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color(hex: "E0E0E0"), lineWidth: 0.5)
        )
    }
}

// MARK: - Ride Offer Card
struct RideOfferCard: View {
    let text: String
    let bgColor: Color
    let iconName: String
    let iconColor: Color

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            VStack(alignment: .leading) {
                Text(text)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.black)
                    .lineSpacing(2)

                Spacer()
            }
            .padding(16)

            Image(systemName: iconName)
                .font(.system(size: 40))
                .foregroundColor(iconColor.opacity(0.4))
                .padding(12)
        }
        .frame(width: 170, height: 130)
        .background(bgColor)
        .cornerRadius(16)
    }
}
