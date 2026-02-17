import SwiftUI

struct IntroPage: Identifiable {
    let id = UUID()
    let emoji: String       // Fallback visual (SF Symbol or emoji)
    let headline: String
    let subheadline: String
    let gradientColors: [Color]
}

struct IntroView: View {
    let onGetStarted: () -> Void

    @State private var currentPage = 0
    private let brandGreen = Color(hex: "34A853")

    private let pages: [IntroPage] = [
        IntroPage(
            emoji: "fork.knife",
            headline: "Fast delivery\nof delicious food",
            subheadline: "Order food within minutes and enjoy fresh meals delivered to your door.",
            gradientColors: [Color(hex: "1a1a1a"), Color(hex: "2d1f0e")]
        ),
        IntroPage(
            emoji: "mappin.and.ellipse",
            headline: "Live tracking\nof your order",
            subheadline: "Know exactly where your order is in real-time from kitchen to doorstep.",
            gradientColors: [Color(hex: "1a1a1a"), Color(hex: "0e1f2d")]
        ),
        IntroPage(
            emoji: "star.fill",
            headline: "Best restaurants\nnear you",
            subheadline: "Discover top-rated cafes and restaurants in your neighborhood.",
            gradientColors: [Color(hex: "1a1a1a"), Color(hex: "1f0e2d")]
        )
    ]

    var body: some View {
        ZStack {
            // Full-screen dark background
            Color.black.ignoresSafeArea()

            // Food imagery background with warm overlay
            ZStack {
                // Warm food-toned gradient
                LinearGradient(
                    colors: pages[currentPage].gradientColors,
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                // Decorative food elements
                foodBackgroundElements
            }

            // Content overlay
            VStack(spacing: 0) {
                Spacer()

                // Main headline
                VStack(alignment: .leading, spacing: 12) {
                    Text(pages[currentPage].headline)
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.white)
                        .lineSpacing(2)
                        .id(currentPage) // Force re-render for animation

                    Text(pages[currentPage].subheadline)
                        .font(.system(size: 15, weight: .regular))
                        .foregroundColor(.white.opacity(0.65))
                        .lineSpacing(3)
                        .id("sub\(currentPage)")
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 28)

                Spacer().frame(height: 32)

                // Page indicators
                HStack(spacing: 8) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        Capsule()
                            .fill(index == currentPage ? Color.white : Color.white.opacity(0.35))
                            .frame(width: index == currentPage ? 24 : 8, height: 8)
                            .animation(.easeInOut(duration: 0.3), value: currentPage)
                    }
                    Spacer()
                }
                .padding(.horizontal, 28)

                Spacer().frame(height: 32)

                // Get Started button
                Button(action: onGetStarted) {
                    Text("Get started")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(brandGreen)
                        .cornerRadius(14)
                }
                .padding(.horizontal, 28)
                .padding(.bottom, 16)
            }
            .padding(.bottom, 20)
        }
        .gesture(
            DragGesture(minimumDistance: 30)
                .onEnded { value in
                    let horizontal = value.translation.width
                    withAnimation(.easeInOut(duration: 0.3)) {
                        if horizontal < -30 && currentPage < pages.count - 1 {
                            currentPage += 1
                        } else if horizontal > 30 && currentPage > 0 {
                            currentPage -= 1
                        }
                    }
                }
        )
        .statusBarHidden(false)
    }

    // MARK: - Decorative Background

    private var foodBackgroundElements: some View {
        ZStack {
            // Large plate/bowl circle at top
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color(hex: "8B6914").opacity(0.3), Color.clear],
                        center: .center,
                        startRadius: 20,
                        endRadius: 200
                    )
                )
                .frame(width: 400, height: 400)
                .offset(x: 40, y: -120)

            // Warm food glow
            Circle()
                .fill(Color(hex: "D4A24E").opacity(0.12))
                .frame(width: 300, height: 300)
                .offset(x: -60, y: -60)
                .blur(radius: 40)

            // Scattered "ingredient" dots
            ForEach(0..<12, id: \.self) { i in
                Circle()
                    .fill(Color.white.opacity(Double.random(in: 0.03...0.08)))
                    .frame(width: CGFloat.random(in: 3...8), height: CGFloat.random(in: 3...8))
                    .offset(
                        x: CGFloat.random(in: -150...150),
                        y: CGFloat.random(in: -300 ... -50)
                    )
            }

            // Page-specific large icon
            VStack {
                Image(systemName: pages[currentPage].emoji)
                    .font(.system(size: 160, weight: .ultraLight))
                    .foregroundColor(.white.opacity(0.06))
                    .rotationEffect(.degrees(-15))
                    .id("icon\(currentPage)")
                Spacer()
            }
            .padding(.top, 60)
        }
    }
}

#Preview {
    IntroView { print("Get started tapped") }
}
