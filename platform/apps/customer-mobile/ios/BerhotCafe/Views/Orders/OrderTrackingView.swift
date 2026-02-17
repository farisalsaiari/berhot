import SwiftUI

struct OrderTrackingView: View {
    let status: String

    private let steps = ["pending", "preparing", "ready", "completed"]

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
                Text("Order Cancelled")
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
                                    .fill(index <= currentIndex ? Color.statusColor(for: step) : Color.gray.opacity(0.2))
                                    .frame(width: 32, height: 32)

                                Image(systemName: stepIcon(step))
                                    .font(.caption.bold())
                                    .foregroundColor(index <= currentIndex ? .white : .gray)
                            }

                            Text(step.capitalized)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(index <= currentIndex ? .textPrimary : .textTertiary)
                        }

                        if index < steps.count - 1 {
                            Rectangle()
                                .fill(index < currentIndex ? Color.brand : Color.gray.opacity(0.2))
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
        case "preparing": return "flame"
        case "ready": return "bell.badge"
        case "completed": return "checkmark"
        default: return "circle"
        }
    }

    private var statusMessage: String {
        switch status.lowercased() {
        case "pending": return "Your order has been received and is waiting to be prepared"
        case "preparing": return "Your order is being prepared right now"
        case "ready": return "Your order is ready for pickup!"
        case "completed": return "Order completed. Enjoy your meal!"
        default: return ""
        }
    }
}
