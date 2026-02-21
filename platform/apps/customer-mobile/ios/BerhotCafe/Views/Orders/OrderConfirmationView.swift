import SwiftUI

struct OrderConfirmationView: View {
    let order: Order
    @Environment(\.dismiss) private var dismiss
    @State private var showCheckmark = false
    @State private var showContent = false
    @State private var showButtons = false
    @State private var showItems = false
    @State private var confettiPieces: [ConfettiPiece] = []
    @State private var emojiBursts: [EmojiBurst] = []
    @State private var ringScale: CGFloat = 0
    @State private var navigateToTracking = false

    private let brandGreen = Color(hex: "00B14F")

    var body: some View {
        NavigationStack {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color(hex: "F0FFF4"), Color.white, Color(hex: "FFF8F0")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ).ignoresSafeArea()

                // Confetti layer
                ForEach(confettiPieces) { piece in
                    ConfettiView(piece: piece)
                }

                // Emoji burst layer
                ForEach(emojiBursts) { burst in
                    EmojiBurstView(burst: burst)
                }

                // Main content
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {

                        // ── Celebration Header ──
                        VStack(spacing: 16) {
                            Spacer().frame(height: 40)

                            // Animated checkmark with rings
                            ZStack {
                                // Outer pulse ring
                                Circle()
                                    .stroke(brandGreen.opacity(0.15), lineWidth: 3)
                                    .frame(width: 140, height: 140)
                                    .scaleEffect(ringScale)
                                    .opacity(2 - ringScale)

                                // Middle glow
                                Circle()
                                    .fill(brandGreen.opacity(0.08))
                                    .frame(width: 120, height: 120)
                                    .scaleEffect(showCheckmark ? 1 : 0.3)

                                // Inner circle
                                Circle()
                                    .fill(
                                        LinearGradient(
                                            colors: [brandGreen, Color(hex: "00D45F")],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 88, height: 88)
                                    .scaleEffect(showCheckmark ? 1 : 0)
                                    .shadow(color: brandGreen.opacity(0.3), radius: 12, y: 4)

                                // Checkmark
                                Image(systemName: "checkmark")
                                    .font(.system(size: 40, weight: .bold))
                                    .foregroundColor(.white)
                                    .scaleEffect(showCheckmark ? 1 : 0)
                                    .rotationEffect(.degrees(showCheckmark ? 0 : -30))
                            }
                            .animation(.spring(response: 0.7, dampingFraction: 0.55), value: showCheckmark)

                            // Title
                            VStack(spacing: 6) {
                                Text(L.orderPlaced)
                                    .font(.system(size: 28, weight: .bold))
                                    .foregroundColor(.textPrimary)

                                Text(L.orderNumber(order.orderNumber))
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(brandGreen)
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 4)
                                    .background(brandGreen.opacity(0.1))
                                    .cornerRadius(20)
                            }
                            .opacity(showContent ? 1 : 0)
                            .offset(y: showContent ? 0 : 20)
                            .animation(.easeOut(duration: 0.5).delay(0.3), value: showContent)

                            // Estimated time
                            HStack(spacing: 10) {
                                Image(systemName: "clock.fill")
                                    .foregroundColor(.orange)
                                    .font(.system(size: 18))
                                Text(L.estimatedTime)
                                    .font(.system(size: 15, weight: .medium))
                                    .foregroundColor(.textSecondary)
                            }
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(Color.orange.opacity(0.08))
                            .cornerRadius(12)
                            .opacity(showContent ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.45), value: showContent)
                        }
                        .padding(.bottom, 24)

                        // ── Order Summary Card ──
                        VStack(alignment: .leading, spacing: 14) {
                            HStack {
                                Image(systemName: "bag.fill")
                                    .foregroundColor(brandGreen)
                                Text(L.orderSummary)
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(.textPrimary)
                                Spacer()
                                Text("\(order.items?.count ?? 0) \(L.items)")
                                    .font(.system(size: 13))
                                    .foregroundColor(.textTertiary)
                            }

                            if let items = order.items {
                                ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                                    HStack(alignment: .top, spacing: 10) {
                                        Text("\(item.quantity)x")
                                            .font(.system(size: 13, weight: .bold))
                                            .foregroundColor(brandGreen)
                                            .frame(width: 28, alignment: .leading)

                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(item.displayName)
                                                .font(.system(size: 14, weight: .medium))
                                                .foregroundColor(.textPrimary)

                                            if let mods = item.modifiers, !mods.isEmpty {
                                                let modNames = mods.compactMap(\.name).joined(separator: " · ")
                                                if !modNames.isEmpty {
                                                    Text(modNames)
                                                        .font(.system(size: 12))
                                                        .foregroundColor(.textTertiary)
                                                }
                                            }
                                        }

                                        Spacer()

                                        Text(item.totalPrice.formattedCurrency)
                                            .font(.system(size: 13, weight: .semibold))
                                            .foregroundColor(.textPrimary)
                                    }
                                    .opacity(showItems ? 1 : 0)
                                    .offset(x: showItems ? 0 : 20)
                                    .animation(
                                        .easeOut(duration: 0.35).delay(0.6 + Double(index) * 0.08),
                                        value: showItems
                                    )

                                    if index < items.count - 1 {
                                        Divider().padding(.leading, 38)
                                    }
                                }
                            }

                            Divider()

                            // Totals
                            VStack(spacing: 6) {
                                HStack {
                                    Text(L.subtotal)
                                        .font(.system(size: 13))
                                        .foregroundColor(.textSecondary)
                                    Spacer()
                                    Text(order.subtotal.formattedCurrency)
                                        .font(.system(size: 13))
                                        .foregroundColor(.textSecondary)
                                }
                                if order.taxAmount > 0 {
                                    HStack {
                                        Text(L.tax)
                                            .font(.system(size: 13))
                                            .foregroundColor(.textSecondary)
                                        Spacer()
                                        Text(order.taxAmount.formattedCurrency)
                                            .font(.system(size: 13))
                                            .foregroundColor(.textSecondary)
                                    }
                                }
                                if let disc = order.discountAmount, disc > 0 {
                                    HStack {
                                        Text(L.discount)
                                            .font(.system(size: 13))
                                            .foregroundColor(brandGreen)
                                        Spacer()
                                        Text("-\(disc.formattedCurrency)")
                                            .font(.system(size: 13))
                                            .foregroundColor(brandGreen)
                                    }
                                }
                                Divider()
                                HStack {
                                    Text(L.totalPaid)
                                        .font(.system(size: 15, weight: .bold))
                                        .foregroundColor(.textPrimary)
                                    Spacer()
                                    Text(order.resolvedTotal.formattedCurrency)
                                        .font(.system(size: 15, weight: .bold))
                                        .foregroundColor(brandGreen)
                                }
                            }
                        }
                        .padding(18)
                        .background(Color.surfacePrimary)
                        .cornerRadius(16)
                        .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
                        .padding(.horizontal, 16)
                        .opacity(showItems ? 1 : 0)
                        .offset(y: showItems ? 0 : 15)
                        .animation(.easeOut(duration: 0.5).delay(0.55), value: showItems)

                        Spacer().frame(height: 24)

                        // ── Delivery info ──
                        HStack(spacing: 14) {
                            VStack(spacing: 6) {
                                ZStack {
                                    Circle()
                                        .fill(Color.blue.opacity(0.1))
                                        .frame(width: 44, height: 44)
                                    Image(systemName: order.orderType == "delivery" ? "bicycle" : "bag.fill")
                                        .font(.system(size: 18))
                                        .foregroundColor(.blue)
                                }
                                Text(order.orderType.capitalized)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.textSecondary)
                            }
                            .frame(maxWidth: .infinity)

                            Rectangle()
                                .fill(Color.gray.opacity(0.2))
                                .frame(width: 1, height: 50)

                            VStack(spacing: 6) {
                                ZStack {
                                    Circle()
                                        .fill(Color.purple.opacity(0.1))
                                        .frame(width: 44, height: 44)
                                    Image(systemName: "creditcard.fill")
                                        .font(.system(size: 18))
                                        .foregroundColor(.purple)
                                }
                                Text(L.paid)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.textSecondary)
                            }
                            .frame(maxWidth: .infinity)

                            Rectangle()
                                .fill(Color.gray.opacity(0.2))
                                .frame(width: 1, height: 50)

                            VStack(spacing: 6) {
                                ZStack {
                                    Circle()
                                        .fill(Color.orange.opacity(0.1))
                                        .frame(width: 44, height: 44)
                                    Image(systemName: "clock.fill")
                                        .font(.system(size: 18))
                                        .foregroundColor(.orange)
                                }
                                Text(L.estimatedDelivery)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.textSecondary)
                            }
                            .frame(maxWidth: .infinity)
                        }
                        .padding(16)
                        .background(Color.surfacePrimary)
                        .cornerRadius(16)
                        .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
                        .padding(.horizontal, 16)
                        .opacity(showButtons ? 1 : 0)
                        .animation(.easeOut(duration: 0.4).delay(0.8), value: showButtons)

                        Spacer().frame(height: 28)

                        // ── Action Buttons ──
                        VStack(spacing: 12) {
                            // Track Order
                            NavigationLink(destination: OrderDetailView(orderId: order.id)) {
                                HStack(spacing: 10) {
                                    Image(systemName: "location.fill")
                                        .font(.system(size: 16))
                                    Text(L.trackOrder)
                                        .font(.system(size: 16, weight: .bold))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(16)
                                .background(
                                    LinearGradient(
                                        colors: [brandGreen, Color(hex: "00C853")],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .foregroundColor(.white)
                                .cornerRadius(14)
                                .shadow(color: brandGreen.opacity(0.3), radius: 8, y: 4)
                            }

                            // Back to Home
                            Button {
                                dismiss()
                            } label: {
                                HStack(spacing: 8) {
                                    Image(systemName: "house.fill")
                                        .font(.system(size: 14))
                                    Text(L.backToHome)
                                        .font(.system(size: 15, weight: .medium))
                                }
                                .foregroundColor(.textSecondary)
                                .frame(maxWidth: .infinity)
                                .padding(14)
                                .background(Color(hex: "F5F5F5"))
                                .cornerRadius(14)
                            }
                        }
                        .padding(.horizontal, 16)
                        .opacity(showButtons ? 1 : 0)
                        .offset(y: showButtons ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.9), value: showButtons)

                        Spacer().frame(height: 50)
                    }
                }
            }
            .navigationBarHidden(true)
        }
        .onAppear {
            triggerCelebration()
        }
    }

    // MARK: - Celebration Orchestration

    private func triggerCelebration() {
        // Haptic burst
        let impact = UIImpactFeedbackGenerator(style: .heavy)
        impact.impactOccurred()

        // Success notification haptic
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        }

        // Double tap haptic
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        }

        // Generate confetti
        generateConfetti()

        // Generate emoji bursts
        generateEmojiBursts()

        // Staggered animations
        withAnimation(.spring(response: 0.7, dampingFraction: 0.55)) {
            showCheckmark = true
        }

        withAnimation(.easeInOut(duration: 2.0).repeatForever(autoreverses: true)) {
            ringScale = 1.8
        }

        withAnimation {
            showContent = true
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            withAnimation {
                showItems = true
            }
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
            withAnimation {
                showButtons = true
            }
        }
    }

    private func generateConfetti() {
        let colors: [Color] = [
            .red, .blue, .green, .orange, .purple, .pink, .yellow,
            brandGreen, Color(hex: "FFD700"), Color(hex: "FF6B6B"), Color(hex: "4ECDC4")
        ]
        confettiPieces = (0..<60).map { i in
            ConfettiPiece(
                id: i,
                color: colors[i % colors.count],
                x: CGFloat.random(in: 0...UIScreen.main.bounds.width),
                delay: Double.random(in: 0...0.8),
                size: CGFloat.random(in: 5...14),
                rotation: Double.random(in: 0...360),
                shape: ConfettiShape.allCases[i % ConfettiShape.allCases.count]
            )
        }
    }

    private func generateEmojiBursts() {
        let emojis = ["🎉", "☕️", "🎊", "✨", "🥳", "🍰", "🎯", "💚"]
        emojiBursts = (0..<12).map { i in
            EmojiBurst(
                id: i,
                emoji: emojis[i % emojis.count],
                x: CGFloat.random(in: 40...(UIScreen.main.bounds.width - 40)),
                startY: UIScreen.main.bounds.height * 0.3,
                delay: Double.random(in: 0.2...1.2),
                scale: CGFloat.random(in: 0.6...1.2)
            )
        }
    }
}

// MARK: - Confetti

enum ConfettiShape: CaseIterable {
    case rectangle, circle, triangle
}

struct ConfettiPiece: Identifiable {
    let id: Int
    let color: Color
    let x: CGFloat
    let delay: Double
    let size: CGFloat
    let rotation: Double
    let shape: ConfettiShape
}

struct ConfettiView: View {
    let piece: ConfettiPiece
    @State private var fallen = false

    var body: some View {
        Group {
            switch piece.shape {
            case .rectangle:
                RoundedRectangle(cornerRadius: 2)
                    .fill(piece.color)
                    .frame(width: piece.size, height: piece.size * 1.5)
            case .circle:
                Circle()
                    .fill(piece.color)
                    .frame(width: piece.size, height: piece.size)
            case .triangle:
                TriangleShape()
                    .fill(piece.color)
                    .frame(width: piece.size, height: piece.size)
            }
        }
        .rotationEffect(.degrees(fallen ? piece.rotation + 720 : piece.rotation))
        .position(
            x: fallen ? piece.x + CGFloat.random(in: -30...30) : piece.x,
            y: fallen ? UIScreen.main.bounds.height + 50 : -30
        )
        .opacity(fallen ? 0 : 1)
        .onAppear {
            withAnimation(
                .easeIn(duration: Double.random(in: 2.5...4.5))
                .delay(piece.delay)
            ) {
                fallen = true
            }
        }
    }
}

struct TriangleShape: Shape {
    func path(in rect: CGRect) -> Path {
        Path { p in
            p.move(to: CGPoint(x: rect.midX, y: rect.minY))
            p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
            p.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
            p.closeSubpath()
        }
    }
}

// MARK: - Emoji Burst

struct EmojiBurst: Identifiable {
    let id: Int
    let emoji: String
    let x: CGFloat
    let startY: CGFloat
    let delay: Double
    let scale: CGFloat
}

struct EmojiBurstView: View {
    let burst: EmojiBurst
    @State private var animate = false

    var body: some View {
        Text(burst.emoji)
            .font(.system(size: 30))
            .scaleEffect(animate ? burst.scale : 0)
            .position(
                x: burst.x,
                y: animate ? burst.startY - CGFloat.random(in: 80...200) : burst.startY
            )
            .opacity(animate ? 0 : 1)
            .onAppear {
                withAnimation(
                    .easeOut(duration: 1.5)
                    .delay(burst.delay)
                ) {
                    animate = true
                }
            }
    }
}
