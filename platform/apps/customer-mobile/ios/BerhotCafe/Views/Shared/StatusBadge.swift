import SwiftUI

struct StatusBadge: View {
    let status: String

    var body: some View {
        Text(status.capitalized)
            .font(.system(size: 11, weight: .semibold))
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.statusColor(for: status).opacity(0.12))
            .foregroundColor(Color.statusColor(for: status))
            .cornerRadius(6)
    }
}
