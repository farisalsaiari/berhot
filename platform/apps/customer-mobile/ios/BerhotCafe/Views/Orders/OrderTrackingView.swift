import SwiftUI

struct OrderTrackingView: View {
    let status: String

    private let steps = ["pending", "accepted", "preparing", "ready", "completed"]
    private let brandGreen = Color(hex: "00B14F")

    private var currentIndex: Int {
        if status.lowercased() == "cancelled" { return -1 }
        return steps.firstIndex(of: status.lowercased()) ?? 0
    }

    var body: some View {
        if status.lowercased() == "cancelled" {
            HStack(spacing: 8) {
                Image(systemName: "xmark.circle.fill")
                    .font(.title2)
                    .foregroundColor(.red)
                Text(L.orderCancelled)
                    .font(.headline)
                    .foregroundColor(.red)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.red.opacity(0.08))
            .cornerRadius(16)
        } else {
            VStack(spacing: 16) {
                // Progress steps
                HStack(spacing: 0) {
                    ForEach(Array(steps.enumerated()), id: \.offset) { index, step in
                        VStack(spacing: 6) {
                            ZStack {
                                Circle()
                                    .fill(index <= currentIndex ? stepColor(step) : Color.gray.opacity(0.2))
                                    .frame(width: 32, height: 32)

                                // Pulsing animation on current step
                                if index == currentIndex {
                                    Circle()
                                        .stroke(stepColor(step).opacity(0.4), lineWidth: 2)
                                        .frame(width: 38, height: 38)
                                        .scaleEffect(1.2)
                                        .opacity(0.5)
                                        .animation(
                                            .easeInOut(duration: 1.2).repeatForever(autoreverses: true),
                                            value: currentIndex
                                        )
                                }

                                Image(systemName: stepIcon(step))
                                    .font(.caption.bold())
                                    .foregroundColor(index <= currentIndex ? .white : .gray)
                            }

                            Text(stepLabel(step))
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(index <= currentIndex ? .textPrimary : .textTertiary)
                                .lineLimit(1)
                        }
                        .frame(maxWidth: .infinity)

                        if index < steps.count - 1 {
                            Rectangle()
                                .fill(index < currentIndex ? brandGreen : Color.gray.opacity(0.2))
                                .frame(height: 2)
                                .frame(maxWidth: .infinity)
                                .offset(y: -10)
                        }
                    }
                }

                // Status text
                Text(statusMessage)
                    .font(.subheadline)
                    .foregroundColor(.textSecondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .background(Color.surfaceSecondary)
            .cornerRadius(16)
        }
    }

    private func stepIcon(_ step: String) -> String {
        switch step {
        case "pending": return "clock"
        case "accepted": return "hand.thumbsup"
        case "preparing": return "flame"
        case "ready": return "bell.badge"
        case "completed": return "checkmark"
        default: return "circle"
        }
    }

    private func stepLabel(_ step: String) -> String {
        switch step {
        case "pending": return L.pending
        case "accepted": return L.accepted
        case "preparing": return L.preparing
        case "ready": return L.ready
        case "completed": return L.done
        default: return step.capitalized
        }
    }

    private func stepColor(_ step: String) -> Color {
        switch step {
        case "pending": return .orange
        case "accepted": return .cyan
        case "preparing": return .blue
        case "ready": return .purple
        case "completed": return brandGreen
        default: return .gray
        }
    }

    private var statusMessage: String {
        switch status.lowercased() {
        case "pending": return L.trackingPending
        case "accepted": return L.trackingAccepted
        case "preparing": return L.trackingPreparing
        case "ready": return L.trackingReady
        case "completed": return L.trackingDone
        default: return ""
        }
    }
}
